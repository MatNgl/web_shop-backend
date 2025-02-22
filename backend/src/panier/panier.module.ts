import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanierService } from './panier.service';
import { PanierController } from './panier.controller';
import { Panier } from './entities/panier.entity';
import { ArticlePanier } from './entities/article-panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Panier, ArticlePanier, Produit])],
  controllers: [PanierController],
  providers: [PanierService],
  exports: [PanierService],
})
export class PanierModule {}
