// src/panier/entities/article-panier.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Panier } from './panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';

@Entity('article_panier')
export class ArticlePanier {
  @PrimaryGeneratedColumn()
  id: number;

  // Lien vers le panier
  @ManyToOne(() => Panier, (panier) => panier.articles, { onDelete: 'CASCADE' })
  panier: Panier;

  // Lien vers le produit
  @ManyToOne(() => Produit, { eager: true })
  produit: Produit;

  @Column({ type: 'int', default: 1 })
  quantite: number;
}
