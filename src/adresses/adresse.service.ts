import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adresse } from './entities/adresse.entity';

@Injectable()
export class AdresseService {
  constructor(
    @InjectRepository(Adresse)
    private readonly adresseRepository: Repository<Adresse>,
  ) {}

  async getAdresses(userId: number): Promise<Adresse[]> {
    return this.adresseRepository.find({ where: { user: { id: userId } } });
  }

  async ajouterAdresse(
    userId: number,
    data: Partial<Adresse>,
  ): Promise<Adresse> {
    const nouvelleAdresse = this.adresseRepository.create({
      ...data,
      user: { id: userId } as any,
    });
    return this.adresseRepository.save(nouvelleAdresse);
  }

  async modifierAdresse(id: number, data: Partial<Adresse>): Promise<Adresse> {
    const adresse = await this.adresseRepository.findOne({ where: { id } });

    if (!adresse) {
      throw new NotFoundException(`Adresse #${id} introuvable.`);
    }

    await this.adresseRepository.update(id, data);
    return this.adresseRepository.findOne({
      where: { id },
    }) as Promise<Adresse>;
  }
  async supprimerAdresse(id: number): Promise<void> {
    const adresse = await this.adresseRepository.findOne({ where: { id } });

    if (!adresse) {
      throw new NotFoundException(`Adresse #${id} introuvable.`);
    }

    await this.adresseRepository.delete(id);
  }
}
