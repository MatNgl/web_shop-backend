import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './entities/commande.entity';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';

@Injectable()
export class CommandesService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async create(createCommandeDto: CreateCommandeDto): Promise<Commande> {
    const commande = this.commandeRepository.create(createCommandeDto);
    return this.commandeRepository.save(commande);
  }

  async findAll(): Promise<Commande[]> {
    return this.commandeRepository.find();
  }

  async findOne(id: number): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({ where: { id } });
    if (!commande) {
      throw new NotFoundException(`Commande #${id} non trouvée`);
    }
    return commande;
  }

  async update(
    id: number,
    updateCommandeDto: UpdateCommandeDto,
  ): Promise<Commande> {
    // Si les deux infos de livraison et paiement sont présentes,
    // on passe le statut à "validated"
    if (updateCommandeDto.shippingAddress && updateCommandeDto.paymentMethod) {
      updateCommandeDto.status = 'validated';
    }
    await this.commandeRepository.update(id, updateCommandeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.commandeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Commande #${id} non trouvée`);
    }
  }
}
