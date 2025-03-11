import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { Produit } from './entities/produit.entity';
import { ProduitImage } from './entities/produit-image.entity';
import { ProduitStatut } from './entities/produit-statuts.entity';
import { DessinNumerique } from './entities/dessin-numerique.entity';
import { Sticker } from './entities/sticker.entity';
import { PromotionsModule } from '../promotions/promotions.module';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produit,
      ProduitImage,
      ProduitStatut,
      DessinNumerique,
      Sticker,
      SousCategorie,
    ]),
    PromotionsModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
  exports: [ProduitsService],
})
export class ProduitsModule {}
