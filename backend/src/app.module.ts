import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { ProduitsModule } from './produits/produits.module';
import { Produit } from './produits/entities/produit.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { PromotionsModule } from './promotions/promotions.module';
import { Promotion } from './promotions/entities/promotion.entity';
import { ProduitStatut } from './produits/entities/produit-statuts.entity';
import { PanierModule } from './panier/panier.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Panier } from './panier/entities/panier.entity';
import { ArticlePanier } from './panier/entities/article-panier.entity';
import { Commande } from './commandes/entities/commande.entity';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { WishlistModule } from './wishlist/wishlist.module';
import { WishlistItem } from './wishlist/entities/wishlist-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
        Category,
        Promotion,
        ProduitStatut,
        Panier,
        ArticlePanier,
        Commande,
        Wishlist,
        WishlistItem,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
