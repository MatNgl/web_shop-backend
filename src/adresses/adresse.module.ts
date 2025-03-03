import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdresseService } from './adresse.service';
import { AdresseController } from './adresse.controller';
import { Adresse } from './entities/adresse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adresse])],
  controllers: [AdresseController],
  providers: [AdresseService],
  exports: [AdresseService],
})
export class AdresseModule {}
