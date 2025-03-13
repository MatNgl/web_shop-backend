// src/produits/entities/produit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';

export enum ProduitType {
  DESSIN_NUMERIQUE = 'dessin numérique',
  STICKER = 'sticker',
  AUTRE = 'autre',
}

@Entity('produit')
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column()
  categorie_id: number;

  @Column({ default: true })
  etat: boolean;

  @Column({ type: 'varchar', default: ProduitType.DESSIN_NUMERIQUE })
  type: ProduitType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProduitImage, (image) => image.produit, { cascade: true })
  images: ProduitImage[];

  /**
   * Relation ManyToOne pour indiquer qu'un produit ne peut avoir qu'une seule promotion
   * (mais une promotion peut s'appliquer à plusieurs produits).
   * => crée la colonne "promotion_id" dans la table "produit".
   */
  @ManyToOne(() => Promotion, (promotion) => promotion.produits, {
    nullable: true,
    cascade: true,
  })
  promotion: Promotion | null;

  // Relation ManyToMany vers SousCategorie (ça, on le garde)
  @ManyToMany(() => SousCategorie, (sousCategorie) => sousCategorie.produits, {
    cascade: true,
  })
  @JoinTable({
    name: 'produit_sous_categorie',
    joinColumn: { name: 'produit_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'sous_categorie_id',
      referencedColumnName: 'id',
    },
  })
  sousCategories: SousCategorie[];
}
