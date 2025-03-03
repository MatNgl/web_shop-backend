import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(
    createPromotionDto: CreatePromotionDto,
    user: UserPayload,
  ): Promise<Promotion> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent créer des promotions.',
      );
    }
    const promotion = this.promotionRepository.create(createPromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return await this.promotionRepository.find();
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion #${id} introuvable`);
    }
    return promotion;
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
    user: UserPayload,
  ): Promise<Promotion> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent modifier des promotions.',
      );
    }
    const promotion = await this.promotionRepository.preload({
      id: id,
      ...updatePromotionDto,
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion #${id} introuvable`);
    }
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: number, user: UserPayload): Promise<void> {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent supprimer des promotions.',
      );
    }
    const result = await this.promotionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion #${id} introuvable`);
    }
  }
}
