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

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
  ) {}

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
    return await this.produitRepository.save(produit);
  }

  async findAll(): Promise<Produit[]> {
    return await this.produitRepository.find();
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({ where: { id } });
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

  // Nouvelle méthode pour récupérer les produits par catégorie
  async findByCategory(categoryId: number): Promise<Produit[]> {
    return await this.produitRepository.find({
      where: { categorie_id: categoryId },
    });
  }
}
