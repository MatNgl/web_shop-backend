// src/produits/entities/produit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
import { ProduitStatut } from './produit-statuts.entity';

@Entity()
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column({ nullable: true })
  stock?: number;

  @Column()
  categorie_id: number;

  @Column({ nullable: true })
  promotion_id?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => ProduitStatut, (statut) => statut.produits, { eager: true })
  statut: ProduitStatut;

  @OneToMany(() => ProduitImage, (image) => image.produit, { cascade: true })
  images: ProduitImage[];
}
