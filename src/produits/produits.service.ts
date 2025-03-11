import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ProduitStatut } from './entities/produit-statuts.entity';
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

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    @InjectRepository(ProduitStatut)
    private readonly produitStatutRepository: Repository<ProduitStatut>,

    @InjectRepository(ProduitImage)
    private readonly produitImageRepository: Repository<ProduitImage>,

    @InjectRepository(DessinNumerique)
    private readonly dessinRepository: Repository<DessinNumerique>,

    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,

    private readonly promotionsService: PromotionsService,

    @InjectRepository(SousCategorie)
    private readonly sousCategorieRepository: Repository<SousCategorie>,
  ) {}

  private async determineStatut(
    stock: number,
    // Pour la détermination du statut, on ne se base plus sur promotion_id,
    // mais éventuellement sur les promotions associées au produit. On peut ici
    // simplifier en ne prenant pas en compte la promotion (ou adapter la logique)
    promotionId?: number | null,
  ): Promise<ProduitStatut> {
    // Votre logique existante reste valable pour déterminer le statut (sans lien direct avec la table de jointure)
    if (promotionId != null) {
      try {
        const promotion = await this.promotionsService.findOne(promotionId);
        if (promotion) {
          const now = new Date();
          const debut = new Date(promotion.date_debut);
          const fin = new Date(promotion.date_fin);
          if (now >= debut && now <= fin) {
            const enPromo = await this.produitStatutRepository.findOne({
              where: { nom: 'En promotion' },
            });
            if (enPromo) return enPromo;
          }
        }
      } catch {
        // Ignorer l'erreur si la promotion n'est pas trouvée
      }
    }
    if (stock === 0) {
      const rupture = await this.produitStatutRepository.findOne({
        where: { nom: 'En rupture' },
      });
      if (rupture) return rupture;
    }
    const disponible = await this.produitStatutRepository.findOne({
      where: { nom: 'Disponible' },
    });
    if (disponible) return disponible;
    const arrete = await this.produitStatutRepository.findOne({
      where: { nom: 'Arrêté' },
    });
    if (arrete) return arrete;
    throw new BadRequestException("Aucun statut n'a pu être déterminé");
  }

  private normalizeEtat(etat: boolean | string | undefined): boolean {
    if (etat === undefined) {
      return true;
    }
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
    const { images, etat, sousCategorieIds, promotion_ids, ...produitData } =
      createProduitDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    produit.statut = await this.determineStatut(produit.stock ?? 0, undefined);
    const savedProduct = await this.produitRepository.save(produit);

    // Association des images
    if (images && images.length > 0) {
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: savedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }

    // Association des promotions
    if (promotion_ids && promotion_ids.length > 0) {
      const promotions = await Promise.all(
        promotion_ids.map(
          async (id) => await this.promotionsService.findOne(id),
        ),
      );
      savedProduct.promotions = promotions;
      await this.produitRepository.save(savedProduct);
    }

    // Association des sous-catégories
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
    const { images, resolution, dimensions, etat, ...produitData } =
      createDessinDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    produit.statut = await this.determineStatut(produit.stock ?? 0, null);
    const savedProduct = await this.produitRepository.save(produit);

    const dessin = this.dessinRepository.create({
      produit_id: savedProduct.id,
      resolution,
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
    const { images, format, dimensions, materiau, etat, ...produitData } =
      createStickerDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = this.normalizeEtat(etat);
    produit.statut = await this.determineStatut(produit.stock ?? 0, null);
    const savedProduct = await this.produitRepository.save(produit);

    const sticker = this.stickerRepository.create({
      produit_id: savedProduct.id,
      format,
      dimensions,
      materiau,
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
      relations: ['statut', 'images', 'promotions'],
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['statut', 'images', 'promotions'],
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
    const { images, etat, sousCategorieIds, promotion_ids, ...updateData } =
      updateProduitDto;
    const produit = await this.produitRepository.preload({ id, ...updateData });
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
    if (images) {
      await this.produitImageRepository.delete({ produit: { id } });
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }
    produit.statut = await this.determineStatut(produit.stock ?? 0, undefined);
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
    stock: number,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent mettre à jour le stock.',
      );
    }
    const produit = await this.findOne(id);
    produit.stock = stock;
    produit.statut = await this.determineStatut(produit.stock ?? 0, null);
    return await this.produitRepository.save(produit);
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
    // Ici, on travaille avec la relation ManyToMany (produit.promotions)
    if (promotionId !== null) {
      // Récupérer la promotion
      const promotion = await this.promotionsService.findOne(promotionId);
      if (!produit.promotions) {
        produit.promotions = [];
      }
      // Ajouter la promotion si elle n'est pas déjà présente
      if (!produit.promotions.find((p) => p.id === promotion.id)) {
        produit.promotions.push(promotion);
      }
    } else {
      // Si promotionId est null, on retire toutes les promotions du produit
      produit.promotions = [];
    }
    // Recalculer le statut (vous pouvez adapter la logique ici selon vos besoins)
    produit.statut = await this.determineStatut(produit.stock ?? 0, null);
    return await this.produitRepository.save(produit);
  }

  async searchByName(nom: string): Promise<Produit[]> {
    if (!nom) {
      throw new Error("Le paramètre 'nom' est requis.");
    }
    return await this.produitRepository.find({
      where: { nom: ILike(`%${nom}%`) },
      relations: ['statut', 'images', 'promotions'],
    });
  }

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['statut', 'images', 'promotions'],
    });
  }

  async findRecommendedProducts(productId: number): Promise<Produit[]> {
    const product = await this.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Produit #${productId} introuvable`);
    }
    const sameCategoryProducts = await this.produitRepository.find({
      where: {
        categorie_id: product.categorie_id,
        id: Not(productId),
      },
      relations: ['statut', 'images', 'promotions'],
    });
    const shuffledSameCategory = sameCategoryProducts.sort(
      () => Math.random() - 0.5,
    );
    const otherProducts = await this.produitRepository.find({
      where: {
        categorie_id: Not(product.categorie_id),
      },
      relations: ['statut', 'images', 'promotions'],
    });
    return [...shuffledSameCategory, ...otherProducts];
  }

  async findNewProducts(): Promise<Produit[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.produitRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.statut', 'statut')
      .leftJoinAndSelect('produit.images', 'images')
      .leftJoinAndSelect('produit.promotions', 'promotions')
      .where('produit.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getMany();
  }

  async findProductsWithActivePromotion(): Promise<Produit[]> {
    // Récupérer tous les produits actifs avec leurs promotions
    const products = await this.produitRepository.find({
      where: { etat: true },
      relations: ['statut', 'images', 'promotions'],
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

  // Dans src/produits/produits.service.ts
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
