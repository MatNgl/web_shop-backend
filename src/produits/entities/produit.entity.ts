// src/produits/entities/produit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
// import { SousCategorie } from 'src/categories/entities/sous-categorie.entity';

@Entity('produit')
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: true })
  etat: boolean;

  @Column()
  categorie_id: number;

  @Column({ nullable: true })
  promotionId?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ProduitImage, (image) => image.produit, { cascade: true })
  images: ProduitImage[];

  // Suppression de la relation ManyToMany avec SousCategorie
  // @ManyToMany(() => SousCategorie, (sousCategorie) => sousCategorie.produits, { cascade: true })
  // @JoinTable({
  //   name: 'produit_sous_categorie',
  //   joinColumn: { name: 'produit_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'sous_categorie_id', referencedColumnName: 'id' },
  // })
  // sousCategories: SousCategorie[];
}
