import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Fonction utilitaire pour déterminer les statuts à appliquer
  private async determineStatuts(
    stock: number,
    promotionId?: number | null,
  ): Promise<ProduitStatut[]> {
    const statuts: ProduitStatut[] = [];

    // Statut basé sur le stock
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

    // Statut promotion si une promotion est définie et active
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
        // Ignorer si la promotion n'est pas trouvée
      }
    }

    // Si aucun statut n'est applicable, on peut ajouter "Arrêté"
    if (statuts.length === 0) {
      const arrete = await this.produitStatutRepository.findOne({
        where: { nom: 'Arrêté' },
      });
      if (arrete) statuts.push(arrete);
    }
    return statuts;
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
    const produit = this.produitRepository.create(createProduitDto);
    produit.statuts = await this.determineStatuts(
      produit.stock ?? 0,
      produit.promotion_id,
    );
    return await this.produitRepository.save(produit);
  }

  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find({ relations: ['statuts'] });
  }

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

  // Nouvelle méthode pour appliquer (ou retirer) une promotion à un produit
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

  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
      relations: ['statuts'],
    });
  }
}
