// src/produits/produits.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ProduitImage } from './entities/produit-image.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { CreateDessinNumeriqueDto } from './dto/create-dessin-numerique.dto';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { DessinNumerique } from './entities/dessin-numerique.entity';
import { Sticker } from './entities/sticker.entity';
import { ArticlePanier } from 'src/panier/entities/article-panier.entity';
import { WishlistItem } from 'src/wishlist/entities/wishlist-item.entity';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';
import { Inventaire } from './entities/inventaire.entity';
import { HistoriqueInventaire } from './entities/historique_inventaire.entity';
import { UpdateDessinNumeriqueDto } from './dto/update-dessin-numerique.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    private readonly promotionsService: PromotionsService,

    @InjectRepository(ProduitImage)
    private readonly produitImageRepository: Repository<ProduitImage>,

    @InjectRepository(DessinNumerique)
    private readonly dessinRepository: Repository<DessinNumerique>,

    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,

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
      promotion_ids,
      stock,
      ...produitData
    } = createProduitDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    const savedProduct = await this.produitRepository.save(produit);

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

    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }

    if (promotion_ids && promotion_ids.length > 0) {
      const promotions = await Promise.all(
        promotion_ids.map(
          async (id) => await this.promotionsService.findOne(id),
        ),
      );
      savedProduct.promotions = promotions;
      await this.produitRepository.save(savedProduct);
    }

    if (sousCategorieIds && sousCategorieIds.length > 0) {
      const sousCategories =
        await this.sousCategorieRepository.findByIds(sousCategorieIds);
      savedProduct.sousCategories = sousCategories;
      await this.produitRepository.save(savedProduct);
    }

    return savedProduct;
  }

  async createDessinNumerique(
    createDessinDto: CreateDessinNumeriqueDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des produits.',
      );
    }
    const { images, resolution, dimensions, etat, stock, ...produitData } =
      createDessinDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    const savedProduct = await this.produitRepository.save(produit);

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

    // Ici, on mappe "resolution" (du DTO) sur "format" de l'entité
    const dessin = this.dessinRepository.create({
      produit_id: savedProduct.id,
      format: resolution,
      dimensions,
    });
    await this.dessinRepository.save(dessin);

    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }
    return savedProduct;
  }

  async createSticker(
    createStickerDto: CreateStickerDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des produits.',
      );
    }
    const {
      images,
      format,
      dimensions,
      materiau,
      etat,
      stock,
      ...produitData
    } = createStickerDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    const savedProduct = await this.produitRepository.save(produit);

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

    // Ici, on mappe "materiau" (du DTO) sur "support" de l'entité Sticker
    const sticker = this.stickerRepository.create({
      produit_id: savedProduct.id,
      format,
      dimensions,
      support: materiau,
    });
    await this.stickerRepository.save(sticker);

    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }
    return savedProduct;
  }

  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({
      relations: ['images', 'promotions', 'sousCategories'],
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['images', 'promotions', 'sousCategories'],
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
    // Exclure "images" du preload pour éviter les problèmes de type
    const {
      images: _ignored,
      etat,
      sousCategorieIds,
      promotion_ids,
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
    if (promotion_ids !== undefined) {
      const promotions = await Promise.all(
        promotion_ids.map(
          async (id) => await this.promotionsService.findOne(id),
        ),
      );
      produit.promotions = promotions;
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

  async updateDessinNumerique(
    id: number,
    updateDessinDto: UpdateDessinNumeriqueDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour un dessin numérique.',
      );
    }
    // Extraire les champs spécifiques (du DTO, "resolution" sera mappé sur "format")
    const { resolution, dimensions, stock, ...produitData } = updateDessinDto;
    const produit = await this.produitRepository.preload({
      id,
      ...produitData,
    } as Partial<Produit>);
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    const dessin = await this.dessinRepository.findOne({
      where: { produit_id: id },
    });
    if (!dessin) {
      throw new NotFoundException(
        `Dessin numérique pour le produit #${id} introuvable`,
      );
    }
    if (resolution !== undefined) dessin.format = resolution;
    if (dimensions !== undefined) dessin.dimensions = dimensions;
    await this.dessinRepository.save(dessin);
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

  async updateSticker(
    id: number,
    updateStickerDto: UpdateStickerDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour un sticker.',
      );
    }
    // Extraire les champs spécifiques (remarquez que "materiau" sera mappé sur "support")
    const { format, dimensions, materiau, stock, ...produitData } =
      updateStickerDto;
    const produit = await this.produitRepository.preload({
      id,
      ...produitData,
    } as Partial<Produit>);
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    const sticker = await this.stickerRepository.findOne({
      where: { produit_id: id },
    });
    if (!sticker) {
      throw new NotFoundException(`Sticker pour le produit #${id} introuvable`);
    }
    if (format !== undefined) sticker.format = format;
    if (dimensions !== undefined) sticker.dimensions = dimensions;
    if (materiau !== undefined) sticker.support = materiau;
    await this.stickerRepository.save(sticker);
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
    const produit = await this.findOne(id);
    if (promotionId !== null) {
      const promotion = await this.promotionsService.findOne(promotionId);
      produit.promotions = produit.promotions || [];
      if (!produit.promotions.find((p) => p.id === promotion.id)) {
        produit.promotions.push(promotion);
      }
    } else {
      produit.promotions = [];
    }
    return await this.produitRepository.save(produit);
  }

  async searchByName(nom: string): Promise<Produit[]> {
    if (!nom) {
      throw new Error("Le paramètre 'nom' est requis.");
    }
    return await this.produitRepository.find({
      where: { nom: ILike(`%${nom}%`) },
      relations: ['images', 'promotions', 'sousCategories'],
    });
  }

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['images', 'promotions', 'sousCategories'],
    });
  }

  async findRecommendedProducts(productId: number): Promise<Produit[]> {
    const product = await this.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    const sameCategoryProducts = await this.produitRepository.find({
      where: { categorie_id: product.categorie_id, id: Not(productId) },
      relations: ['images', 'promotions', 'sousCategories'],
    });
    const shuffledSameCategory = sameCategoryProducts.sort(
      () => Math.random() - 0.5,
    );
    const otherProducts = await this.produitRepository.find({
      where: { categorie_id: Not(product.categorie_id) },
      relations: ['images', 'promotions', 'sousCategories'],
    });
    return [...shuffledSameCategory, ...otherProducts];
  }

  async findNewProducts(): Promise<Produit[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.produitRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.images', 'images')
      .leftJoinAndSelect('produit.promotions', 'promotions')
      .leftJoinAndSelect('produit.sousCategories', 'sousCategories')
      .where('produit.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getMany();
  }

  async findProductsWithActivePromotion(): Promise<Produit[]> {
    const products = await this.produitRepository.find({
      where: { etat: true },
      relations: ['images', 'promotions', 'sousCategories'],
    });
    const now = new Date();
    return products.filter(
      (product) =>
        product.promotions &&
        product.promotions.some(
          (promo) =>
            now >= new Date(promo.date_debut) &&
            now <= new Date(promo.date_fin),
        ),
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
      relations: ['promotions'],
    });
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    product.promotions = product.promotions.filter((p) => p.id !== promotionId);
    return await this.produitRepository.save(product);
  }
}
