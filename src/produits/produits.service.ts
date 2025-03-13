// src/produits/produits.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Produit, ProduitType } from './entities/produit.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ProduitImage } from './entities/produit-image.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { ProduitDetail } from './entities/produit-detail.entity';
import { ArticlePanier } from 'src/panier/entities/article-panier.entity';
import { WishlistItem } from 'src/wishlist/entities/wishlist-item.entity';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';
import { Inventaire } from './entities/inventaire.entity';
import { HistoriqueInventaire } from './entities/historique_inventaire.entity';
import { UpdateProduitDetailDto } from './dto/update-produit-detail.dto';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    private readonly promotionsService: PromotionsService,

    @InjectRepository(ProduitImage)
    private readonly produitImageRepository: Repository<ProduitImage>,

    @InjectRepository(ProduitDetail)
    private readonly produitDetailRepository: Repository<ProduitDetail>,

    @InjectRepository(SousCategorie)
    private readonly sousCategorieRepository: Repository<SousCategorie>,

    @InjectRepository(Inventaire)
    private readonly inventaireRepository: Repository<Inventaire>,

    @InjectRepository(HistoriqueInventaire)
    private readonly historiqueInventaireRepository: Repository<HistoriqueInventaire>,
  ) {}

  private normalizeEtat(etat: boolean | string | undefined): boolean {
    if (etat === undefined) return true;
    if (typeof etat === 'string') {
      return etat.toLowerCase() === 'true' || etat.toLowerCase() === 'actif';
    }
    return etat;
  }

  async create(
    createProduitDto: CreateProduitDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des produits.',
      );
    }
    const {
      images,
      etat,
      sousCategorieIds,
      promotion_id,
      stock,
      detail,
      ...produitData
    } = createProduitDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    produit.type = createProduitDto.type;
    // Si une promotion est fournie, la récupérer et l'assigner
    if (promotion_id) {
      const promo = await this.promotionsService.findOne(promotion_id);
      produit.promotion = promo;
    }
    const savedProduct = await this.produitRepository.save(produit);

    // Gestion du stock
    if (stock !== undefined) {
      const inventaire = this.inventaireRepository.create({
        produit_id: savedProduct.id,
        quantite: stock,
      });
      await this.inventaireRepository.save(inventaire);
      await this.historiqueInventaireRepository.save({
        produit_id: savedProduct.id,
        quantite_avant: 0,
        quantite_apres: stock,
        modifie_par: user.id,
      });
    }

    // Sauvegarde des images
    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }

    // Association des sous-catégories
    if (sousCategorieIds && sousCategorieIds.length > 0) {
      const sousCategories =
        await this.sousCategorieRepository.findByIds(sousCategorieIds);
      savedProduct.sousCategories = sousCategories;
      await this.produitRepository.save(savedProduct);
    }

    // Gestion des détails pour les types dessin numérique ou sticker
    if (
      (savedProduct.type === ProduitType.DESSIN_NUMERIQUE ||
        savedProduct.type === ProduitType.STICKER) &&
      detail
    ) {
      const produitDetail = this.produitDetailRepository.create({
        produit_id: savedProduct.id,
        format: detail.format,
        dimensions: detail.dimensions,
        support: detail.support,
      });
      await this.produitDetailRepository.save(produitDetail);
    }

    return savedProduct;
  }

  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({
      relations: ['images', 'promotion', 'sousCategories'],
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['images', 'promotion', 'sousCategories'],
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return produit;
  }

  async update(
    id: number,
    updateProduitDto: UpdateProduitDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour des produits.',
      );
    }
    const {
      images: _ignored,
      etat,
      sousCategorieIds,
      promotion_id,
      stock,
      ...updateData
    } = updateProduitDto;
    const produit = await this.produitRepository.preload({
      id,
      ...updateData,
    } as Partial<Produit>);
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    if (etat !== undefined) {
      produit.etat = this.normalizeEtat(etat);
    }
    if (promotion_id !== undefined) {
      if (promotion_id) {
        const promo = await this.promotionsService.findOne(promotion_id);
        produit.promotion = promo;
      } else {
        produit.promotion = null;
      }
    }
    if (sousCategorieIds !== undefined) {
      const sousCategories =
        await this.sousCategorieRepository.findByIds(sousCategorieIds);
      produit.sousCategories = sousCategories;
    }
    if (_ignored) {
      await this.produitImageRepository.delete({ produit: { id } });
      for (const url of _ignored) {
        const produitImage = this.produitImageRepository.create({
          produit,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }
    if (stock !== undefined) {
      let inventaire = await this.inventaireRepository.findOne({
        where: { produit_id: id },
      });
      if (!inventaire) {
        inventaire = this.inventaireRepository.create({
          produit_id: id,
          quantite: stock,
        });
        await this.inventaireRepository.save(inventaire);
        await this.historiqueInventaireRepository.save({
          produit_id: id,
          quantite_avant: 0,
          quantite_apres: stock,
          modifie_par: user.id,
        });
      } else {
        const previousStock = inventaire.quantite;
        inventaire.quantite = stock;
        await this.inventaireRepository.save(inventaire);
        await this.historiqueInventaireRepository.save({
          produit_id: id,
          quantite_avant: previousStock,
          quantite_apres: stock,
          modifie_par: user.id,
        });
      }
    }
    return await this.produitRepository.save(produit);
  }

  async updateProduitDetail(
    id: number,
    updateDetailDto: UpdateProduitDetailDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour les détails du produit.',
      );
    }
    const produit = await this.findOne(id);
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    const detail = await this.produitDetailRepository.findOne({
      where: { produit_id: id },
    });
    if (!detail) {
      throw new NotFoundException(
        `Détails pour le produit #${id} introuvables`,
      );
    }
    Object.assign(detail, updateDetailDto);
    await this.produitDetailRepository.save(detail);
    return await this.produitRepository.save(produit);
  }

  async remove(id: number, user: UserPayload): Promise<void> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent supprimer des produits.',
      );
    }
    await this.produitRepository.manager
      .getRepository(WishlistItem)
      .delete({ produit: { id } });
    await this.produitRepository.manager
      .getRepository(ArticlePanier)
      .delete({ produit: { id } });
    const result = await this.produitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
  }

  async updateStock(
    id: number,
    newStock: number,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour le stock.',
      );
    }
    const produit = await this.findOne(id);
    let inventaire = await this.inventaireRepository.findOne({
      where: { produit_id: id },
    });
    if (!inventaire) {
      inventaire = this.inventaireRepository.create({
        produit_id: id,
        quantite: newStock,
      });
      await this.inventaireRepository.save(inventaire);
      await this.historiqueInventaireRepository.save({
        produit_id: id,
        quantite_avant: 0,
        quantite_apres: newStock,
        modifie_par: user.id,
      });
    } else {
      const previousStock = inventaire.quantite;
      inventaire.quantite = newStock;
      await this.inventaireRepository.save(inventaire);
      await this.historiqueInventaireRepository.save({
        produit_id: id,
        quantite_avant: previousStock,
        quantite_apres: newStock,
        modifie_par: user.id,
      });
    }
    return produit;
  }

  async applyPromotion(
    id: number,
    promotionId: number | null,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent appliquer une promotion.',
      );
    }
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['promotions'],
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    if (promotionId !== null) {
      const promotion = await this.promotionsService.findOne(promotionId);
      produit.promotion = promotion;
    } else {
      produit.promotion = null;
    }
    return await this.produitRepository.save(produit);
  }

  async searchByName(nom: string): Promise<Produit[]> {
    if (!nom) {
      throw new Error("Le paramètre 'nom' est requis.");
    }
    return await this.produitRepository.find({
      where: { nom: ILike(`%${nom}%`) },
      relations: ['images', 'promotion', 'sousCategories'],
    });
  }

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['images', 'promotion', 'sousCategories'],
    });
  }

  async findRecommendedProducts(productId: number): Promise<Produit[]> {
    const product = await this.produitRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    const sameCategoryProducts = await this.produitRepository.find({
      where: { categorie_id: product.categorie_id, id: Not(productId) },
      relations: ['images', 'promotion', 'sousCategories'],
    });
    const shuffledSameCategory = sameCategoryProducts.sort(
      () => Math.random() - 0.5,
    );
    const otherProducts = await this.produitRepository.find({
      where: { categorie_id: Not(product.categorie_id) },
      relations: ['images', 'promotion', 'sousCategories'],
    });
    return [...shuffledSameCategory, ...otherProducts];
  }

  async findNewProducts(): Promise<Produit[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.produitRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.images', 'images')
      .leftJoinAndSelect('produit.promotion', 'promotion')
      .leftJoinAndSelect('produit.sousCategories', 'sousCategories')
      .where('produit.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getMany();
  }

  async findProductsWithActivePromotion(): Promise<Produit[]> {
    const products = await this.produitRepository.find({
      where: { etat: true },
      relations: ['images', 'promotion', 'sousCategories'],
    });
    const now = new Date();
    return products.filter(
      (product) =>
        product.promotion &&
        now >= new Date(product.promotion.date_debut) &&
        now <= new Date(product.promotion.date_fin),
    );
  }

  async removePromotionFromProduct(
    productId: number,
    promotionId: number,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent modifier les promotions.',
      );
    }
    const product = await this.produitRepository.findOne({
      where: { id: productId },
      relations: ['promotion'],
    });
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    // Si la promotion assignée correspond à l'ID à retirer, on la supprime
    if (product.promotion && product.promotion.id === promotionId) {
      product.promotion = null;
    }
    return await this.produitRepository.save(product);
  }
}
