// src/produits/produits.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { Produit } from './entities/produit.entity';
import { ProduitImage } from './entities/produit-image.entity';
import { ProduitDetail } from './entities/produit-detail.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';
import { Inventaire } from './entities/inventaire.entity';
import { HistoriqueInventaire } from './entities/historique_inventaire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produit,
      ProduitImage,
      ProduitDetail,
      SousCategorie,
      Inventaire,
      HistoriqueInventaire,
    ]),
    PromotionsModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
  exports: [ProduitsService],
})
export class ProduitsModule {}
