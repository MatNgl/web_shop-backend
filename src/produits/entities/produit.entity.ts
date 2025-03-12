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
  TableInheritance,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Produit {
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

  @Column({ default: 'dessin numerique' })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProduitImage, (image) => image.produit, { cascade: true })
  images: ProduitImage[];

  @ManyToMany(() => Promotion, (promotion) => promotion.produits, {
    cascade: true,
  })
  @JoinTable({
    name: 'promotion_produit',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
  })
  promotions: Promotion[];

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
