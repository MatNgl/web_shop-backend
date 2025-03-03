import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Panier } from './entities/panier.entity';
import { ArticlePanier } from './entities/article-panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';
import { PanierService } from './panier.service';
import { PanierController } from './panier.controller';
import { CommandesModule } from 'src/commandes/commandes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Panier, ArticlePanier, Produit]),
    CommandesModule,
  ],
  providers: [PanierService],
  controllers: [PanierController],
  exports: [PanierService],
})
export class PanierModule {}
