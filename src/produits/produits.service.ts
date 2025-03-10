import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ProduitStatut } from './entities/produit-statuts.entity';
import { ProduitImage } from './entities/produit-image.entity';
import { CreateDessinNumeriqueDto } from './dto/create-dessin-numerique.dto';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { DessinNumerique } from './entities/dessin-numerique.entity';
import { Sticker } from './entities/sticker.entity';
import { ArticlePanier } from 'src/panier/entities/article-panier.entity';
import { WishlistItem } from 'src/wishlist/entities/wishlist-item.entity';

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
  ) {}

  private async determineStatut(
    stock: number,
    promotionId?: number | null,
  ): Promise<ProduitStatut> {
    // Vérifier la promotion active en priorité
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
      } catch (error) {
        // Ignorer l'erreur si la promotion n'est pas trouvée
      }
    }

    // Si le stock est 0, statut "En rupture"
    if (stock === 0) {
      const rupture = await this.produitStatutRepository.findOne({
        where: { nom: 'En rupture' },
      });
      if (rupture) return rupture;
    }

    // Statut "Disponible" par défaut
    const disponible = await this.produitStatutRepository.findOne({
      where: { nom: 'Disponible' },
    });
    if (disponible) return disponible;

    // Sinon, statut "Arrêté"
    const arrete = await this.produitStatutRepository.findOne({
      where: { nom: 'Arrêté' },
    });
    if (arrete) return arrete;

    throw new BadRequestException("Aucun statut n'a pu être déterminé");
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
    const { images, etat, ...produitData } = createProduitDto;
    const produit = this.produitRepository.create(produitData);
    produit.etat = etat ?? 'actif';
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    const savedProduct = await this.produitRepository.save(produit);

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
    produit.etat = etat ?? 'actif';
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
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
    produit.etat = etat ?? 'actif';
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
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
      relations: ['statut', 'images'],
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['statut', 'images'],
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
    const { images, etat, ...updateData } = updateProduitDto;
    const produit = await this.produitRepository.preload({
      id,
      ...updateData,
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    if (etat) {
      produit.etat = etat;
    }
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    const updatedProduct = await this.produitRepository.save(produit);

    if (images) {
      await this.produitImageRepository.delete({ produit: { id } });
      for (const url of images) {
        const produitImage = this.produitImageRepository.create({
          produit: updatedProduct,
          url,
        });
        await this.produitImageRepository.save(produitImage);
      }
    }
    return updatedProduct;
  }

  async remove(id: number, user: UserPayload): Promise<void> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent supprimer des produits.',
      );
    }

    // Supprimer les articles de wishlist liés à ce produit
    await this.produitRepository.manager
      .getRepository(WishlistItem)
      .delete({ produit: { id } });

    // Supprimer les articles de panier liés à ce produit
    await this.produitRepository.manager
      .getRepository(ArticlePanier)
      .delete({ produit: { id } });

    // Supprimer le produit
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
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
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
    produit.promotion_id = promotionId === null ? undefined : promotionId;
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  async searchByName(nom: string): Promise<Produit[]> {
    if (!nom) {
      throw new Error("Le paramètre 'nom' est requis.");
    }
    return await this.produitRepository.find({
      where: { nom: ILike(`%${nom}%`) },
      relations: ['statut', 'images'],
    });
  }

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['statut', 'images'],
    });
  }
}
