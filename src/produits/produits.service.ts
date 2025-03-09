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

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    @InjectRepository(ProduitStatut)
    private readonly produitStatutRepository: Repository<ProduitStatut>,

    @InjectRepository(ProduitImage)
    private readonly produitImageRepository: Repository<ProduitImage>,

    private readonly promotionsService: PromotionsService,
  ) {}

  /**
   * Détermine le statut à appliquer à un produit en fonction du stock et de la promotion.
   * Logique :
   * - Si une promotion active est définie, retourne "En promotion".
   * - Sinon, si le stock est 0, retourne "En rupture".
   * - Sinon, retourne "Disponible".
   * - Si aucun statut n'est trouvé, retourne "Arrêté".
   *
   * @param stock Nombre de produits en stock.
   * @param promotionId ID de la promotion, s'il existe.
   * @returns Le ProduitStatut déterminé.
   */
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

  /**
   * Crée un nouveau produit (admin uniquement).
   * Permet d'inclure un tableau d'URLs d'images via createProduitDto.images.
   */
  async create(
    createProduitDto: CreateProduitDto,
    user: UserPayload,
  ): Promise<Produit> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des produits.',
      );
    }
    // Extraire images du DTO
    const { images, ...produitData } = createProduitDto;
    const produit = this.produitRepository.create(produitData);
    // Déterminer le statut unique à appliquer
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    const savedProduct = await this.produitRepository.save(produit);

    // Si des images sont fournies, les insérer dans la table produit_image
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

  /**
   * Récupère tous les produits, incluant leur statut et leurs images.
   */
  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({
      relations: ['statut', 'images'],
    });
  }

  /**
   * Récupère un produit par son ID, incluant son statut et ses images.
   */
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

  /**
   * Met à jour un produit existant (admin uniquement).
   * Si updateProduitDto.images est fourni, les anciennes images sont remplacées par les nouvelles.
   */
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
    const { images, ...updateData } = updateProduitDto;
    const produit = await this.produitRepository.preload({
      id: id,
      ...updateData,
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    const updatedProduct = await this.produitRepository.save(produit);

    if (images) {
      // Supprimer les anciennes images
      await this.produitImageRepository.delete({ produit: { id } });
      // Insérer les nouvelles images
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

  /**
   * Supprime un produit (admin uniquement).
   */
  async remove(id: number, user: UserPayload): Promise<void> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent supprimer des produits.',
      );
    }
    const result = await this.produitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
  }

  /**
   * Met à jour le stock d'un produit (admin uniquement).
   */
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

  /**
   * Applique ou retire une promotion à un produit (admin uniquement).
   */
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
    // Si promotionId est null, on le supprime (stocke undefined)
    produit.promotion_id = promotionId === null ? undefined : promotionId;
    produit.statut = await this.determineStatut(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  /**
   * Recherche des produits par nom (insensible à la casse).
   */
  async searchByName(nom: string): Promise<Produit[]> {
    try {
      if (!nom) {
        throw new Error("Le paramètre 'nom' est requis.");
      }
      return await this.produitRepository.find({
        where: { nom: ILike(`%${nom}%`) },
        relations: ['statut', 'images'],
      });
    } catch (error) {
      console.error('Erreur lors de la recherche par nom:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les produits appartenant à une catégorie donnée.
   */
  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['statut', 'images'],
    });
  }
}
