// src/produits/produits.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { Produit } from './entities/produit.entity';
import { ProduitImage } from './entities/produit-image.entity';
import { PromotionsModule } from '../promotions/promotions.module';
// import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';
import { Detail } from './entities/detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produit,
      ProduitImage,
      Detail,
      // SousCategorie (retiré)
    ]),
    PromotionsModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
  exports: [ProduitsService],
})
export class ProduitsModule {}
