/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { ProduitsModule } from './produits/produits.module';
import { Produit } from './produits/entities/produit.entity';
import { ProduitImage } from './produits/entities/produit-image.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { SousCategorie } from './categories/entities/sous-categorie.entity';
import { PromotionsModule } from './promotions/promotions.module';
import { Promotion } from './promotions/entities/promotion.entity';
import { PanierModule } from './panier/panier.module';
import { Panier } from './panier/entities/panier.entity';
import { ArticlePanier } from './panier/entities/article-panier.entity';
import { Commande } from './commandes/entities/commande.entity';
import { WishlistModule } from './wishlist/wishlist.module';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { WishlistItem } from './wishlist/entities/wishlist-item.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { DessinNumerique } from './produits/entities/dessin-numerique.entity';
import { Sticker } from './produits/entities/sticker.entity';
import { AdresseModule } from './adresses/adresse.module';
import { Inventaire } from './produits/entities/inventaire.entity';
import { HistoriqueInventaire } from './produits/entities/historique_inventaire.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'web_shop',
      entities: [
        User,
        Produit,
        ProduitImage,
        Category,
        SousCategorie,
        Promotion,
        Panier,
        ArticlePanier,
        Commande,
        Wishlist,
        WishlistItem,
        DessinNumerique,
        Sticker,
        Inventaire,
        HistoriqueInventaire,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProduitsModule,
    PanierModule,
    PromotionsModule,
    WishlistModule,
    AdresseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
