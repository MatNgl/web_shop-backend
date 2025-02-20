import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { Produit } from './entities/produit.entity';
import { ProduitStatut } from './entities/produit-statuts.entity';
import { PromotionsModule } from 'src/promotions/promotions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produit, ProduitStatut]),
    PromotionsModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
  exports: [ProduitsService],
})
export class ProduitsModule {}
