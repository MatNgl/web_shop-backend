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
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { CreateDessinDto } from './dto/create-dessin.dto';
import { Sticker } from './entities/sticker.entity';
import { Dessin } from './entities/dessin.entity';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { ArticlePanier } from 'src/panier/entities/article-panier.entity';
import { WishlistItem } from 'src/wishlist/entities/wishlist-item.entity';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    @InjectRepository(ProduitImage)
    private readonly produitImageRepository: Repository<ProduitImage>,

    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,

    @InjectRepository(Dessin)
    private readonly dessinRepository: Repository<Dessin>,

    private readonly promotionsService: PromotionsService,
  ) {}

  private normalizeEtat(etat: boolean | string | undefined): boolean {
    if (etat === undefined) return true;
    if (typeof etat === 'string') {
      return etat.toLowerCase() === 'true' || etat.toLowerCase() === 'actif';
    }
    return etat;
  }

  // Méthode spécifique pour créer un sticker
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
      stock,
      format,
      dimensions,
      support,
      prix,
      promotionId,
      // Retrait de sousCategorieIds
      ...produitData
    } = createStickerDto;

    // Création de l'enregistrement commun dans la table Produit
    const produit = this.produitRepository.create({
      ...produitData,
      categorie_id: createStickerDto.categorie_id,
    });
    produit.etat = this.normalizeEtat(createStickerDto.etat);
    if (promotionId) {
      await this.promotionsService.findOne(promotionId);
      produit.promotionId = promotionId;
    }
    const savedProduit = await this.produitRepository.save(produit);

    // Sauvegarde des images associées
    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduit,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }

    // Création de l'enregistrement spécifique dans la table Sticker
    const sticker = this.stickerRepository.create({
      produit_id: savedProduit.id,
      format,
      dimensions,
      support,
      prix,
      stock,
    });
    await this.stickerRepository.save(sticker);

    return savedProduit;
  }

  // Méthode spécifique pour créer un dessin
  async createDessin(
    createDessinDto: CreateDessinDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des produits.',
      );
    }
    const {
      images,
      stock,
      format,
      dimensions,
      support,
      prix,
      promotionId,
      // Retrait de sousCategorieIds
      ...produitData
    } = createDessinDto;

    // Création de l'enregistrement commun dans la table Produit
    const produit = this.produitRepository.create({
      ...produitData,
      categorie_id: createDessinDto.categorie_id,
    });
    produit.etat = this.normalizeEtat(createDessinDto.etat);
    if (promotionId) {
      await this.promotionsService.findOne(promotionId);
      produit.promotionId = promotionId;
    }
    const savedProduit = await this.produitRepository.save(produit);

    // Sauvegarde des images associées
    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduit,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }

    // Création de l'enregistrement spécifique dans la table Dessin
    const dessin = this.dessinRepository.create({
      produit_id: savedProduit.id,
      format,
      dimensions,
      support,
      prix,
      stock,
    });
    await this.dessinRepository.save(dessin);

    return savedProduit;
  }

  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({
      relations: ['images'], // Retrait de sousCategories
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['images'], // Retrait de sousCategories
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
      promotion_id,
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
        await this.promotionsService.findOne(promotion_id);
        produit.promotionId = promotion_id;
      } else {
        produit.promotionId = undefined;
      }
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
    const produit = await this.produitRepository.findOne({ where: { id } });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    if (promotionId !== null) {
      await this.promotionsService.findOne(promotionId);
      produit.promotionId = promotionId;
    } else {
      produit.promotionId = undefined;
    }
    return await this.produitRepository.save(produit);
  }

  async searchByName(nom: string): Promise<Produit[]> {
    if (!nom) {
      throw new Error("Le paramètre 'nom' est requis.");
    }
    return await this.produitRepository.find({
      where: { nom: ILike(`%${nom}%`) },
      relations: ['images'], // Retrait de sousCategories
    });
  }

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['images'], // Retrait de sousCategories
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
      relations: ['images'], // Retrait de sousCategories
    });
    const shuffledSameCategory = sameCategoryProducts.sort(
      () => Math.random() - 0.5,
    );
    const otherProducts = await this.produitRepository.find({
      where: { categorie_id: Not(product.categorie_id) },
      relations: ['images'], // Retrait de sousCategories
    });
    return [...shuffledSameCategory, ...otherProducts];
  }

  async findNewProducts(): Promise<Produit[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.produitRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.images', 'images')
      .where('produit.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getMany();
  }

  async findProductsWithActivePromotion(): Promise<Produit[]> {
    const products = await this.produitRepository.find({
      where: { etat: true, promotionId: Not(null as any) },
      relations: [], // Retrait de sousCategories
    });
    const now = new Date();
    const filteredProducts: Produit[] = [];
    for (const product of products) {
      if (product.promotionId !== undefined) {
        const promo = await this.promotionsService.findOne(product.promotionId);
        if (
          promo &&
          now >= new Date(promo.date_debut) &&
          now <= new Date(promo.date_fin)
        ) {
          filteredProducts.push(product);
        }
      }
    }
    return filteredProducts;
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
    });
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    if (product.promotionId === promotionId) {
      product.promotionId = undefined;
    }
    return await this.produitRepository.save(product);
  }
}
