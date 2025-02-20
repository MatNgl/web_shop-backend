import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
  ) {}

  async create(createProduitDto: CreateProduitDto): Promise<Produit> {
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
  ): Promise<Produit> {
    const produit = await this.produitRepository.preload({
      id: id,
      ...updateProduitDto,
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return this.produitRepository.save(produit);
  }

  async remove(id: number): Promise<void> {
    const result = await this.produitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
  }
}
