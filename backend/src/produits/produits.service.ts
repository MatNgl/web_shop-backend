import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ProduitStatut } from './entities/produit-statuts.entity';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
    @InjectRepository(ProduitStatut)
    private readonly produitStatutRepository: Repository<ProduitStatut>,
    private readonly promotionsService: PromotionsService,
  ) {}

  /**
   * Fonction utilitaire pour déterminer la liste des statuts à appliquer
   * en fonction du stock et de la promotion.
   * - Si le stock est 0, ajoute "En rupture".
   * - Si le stock > 0, ajoute "Disponible".
   * - Si une promotion est définie et active (en fonction des dates), ajoute "En promotion".
   * - Si aucun statut n'est applicable, ajoute "Arrêté".
   *
   * @param stock Nombre de produits en stock.
   * @param promotionId ID de la promotion, s'il existe.
   * @returns Une liste de statuts (ProduitStatut[]) à appliquer.
   */
  private async determineStatuts(
    stock: number,
    promotionId?: number | null,
  ): Promise<ProduitStatut[]> {
    const statuts: ProduitStatut[] = [];

    // Statut basé sur le stock : en rupture si stock = 0, sinon disponible.
    if (stock === 0) {
      const rupture = await this.produitStatutRepository.findOne({
        where: { nom: 'En rupture' },
      });
      if (rupture) statuts.push(rupture);
    } else {
      const disponible = await this.produitStatutRepository.findOne({
        where: { nom: 'Disponible' },
      });
      if (disponible) statuts.push(disponible);
    }

    // Si une promotion est définie, vérifier sa validité (période active)
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
            if (enPromo) statuts.push(enPromo);
          }
        }
      } catch (error) {
        // Si la promotion n'est pas trouvée, on ignore cette règle
      }
    }

    // Si aucun statut n'est déterminé, ajouter "Arrêté"
    if (statuts.length === 0) {
      const arrete = await this.produitStatutRepository.findOne({
        where: { nom: 'Arrêté' },
      });
      if (arrete) statuts.push(arrete);
    }
    return statuts;
  }

  /**
   * Crée un nouveau produit.
   * Seuls les administrateurs peuvent créer un produit.
   * Le statut du produit est déterminé automatiquement en fonction du stock et de la promotion.
   *
   * @param createProduitDto Données de création du produit.
   * @param user L'utilisateur effectuant l'opération (doit être admin).
   * @returns Le produit créé.
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
    const produit = this.produitRepository.create(createProduitDto);
    produit.statuts = await this.determineStatuts(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  /**
   * Récupère tous les produits.
   * Accessible à tous.
   *
   * @returns La liste de tous les produits, incluant leurs statuts.
   */
  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({ relations: ['statuts'] });
  }

  /**
   * Récupère un produit par son ID.
   *
   * @param id ID du produit à récupérer.
   * @returns Le produit correspondant.
   */
  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['statuts'],
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return produit;
  }

  /**
   * Met à jour un produit existant.
   * Seuls les administrateurs peuvent mettre à jour des produits.
   * Le statut est recalculé après mise à jour.
   *
   * @param id ID du produit à mettre à jour.
   * @param updateProduitDto Données de mise à jour.
   * @param user L'utilisateur effectuant l'opération.
   * @returns Le produit mis à jour.
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
    const produit = await this.produitRepository.preload({
      id: id,
      ...updateProduitDto,
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    produit.statuts = await this.determineStatuts(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  /**
   * Supprime un produit.
   * Seuls les administrateurs peuvent supprimer un produit.
   *
   * @param id ID du produit à supprimer.
   * @param user L'utilisateur effectuant l'opération.
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
   * Met à jour le stock d'un produit.
   * Seuls les administrateurs peuvent modifier le stock.
   * Le statut est recalculé après modification du stock.
   *
   * @param id ID du produit.
   * @param stock Nouvelle quantité en stock.
   * @param user L'utilisateur effectuant l'opération.
   * @returns Le produit mis à jour.
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
    produit.statuts = await this.determineStatuts(
      produit.stock,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  /**
   * Applique ou retire une promotion à un produit.
   * Seuls les administrateurs peuvent appliquer ou retirer une promotion.
   * Le champ promotion_id est mis à jour, et les statuts sont recalculés.
   *
   * @param id ID du produit.
   * @param promotionId ID de la promotion à appliquer, ou null pour retirer.
   * @param user L'utilisateur effectuant l'opération.
   * @returns Le produit mis à jour.
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
    produit.promotion_id = promotionId;
    produit.statuts = await this.determineStatuts(
      produit.stock,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  /**
   * Recherche des produits par nom (insensible à la casse).
   *
   * @param nom Terme à rechercher dans le nom du produit.
   * @returns Une liste de produits correspondants.
   */
  async searchByName(nom: string): Promise<Produit[]> {
    try {
      if (!nom) {
        throw new Error("Le paramètre 'nom' est requis.");
      }
      return await this.produitRepository.find({
        where: { nom: ILike(`%${nom}%`) },
        relations: ['statuts'],
      });
    } catch (error) {
      console.error('Erreur lors de la recherche par nom:', error);
      throw error;
    }
  }
  /**
   * Récupère tous les produits appartenant à une catégorie donnée.
   *
   * @param categoryId ID de la catégorie.
   * @returns Une liste de produits associés à la catégorie.
   */
  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['statuts'],
    });
  }
}
