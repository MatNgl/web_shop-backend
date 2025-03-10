import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
import { ProduitStatut } from './produit-statuts.entity';

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

  @Column({ nullable: true })
  stock?: number;

  @Column()
  categorie_id: number;

  @Column({ nullable: true })
  promotion_id?: number;

  @Column({ default: 'actif' })
  etat: string;

  @Column({ default: 'dessin numerique' })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => ProduitStatut, (statut) => statut.produits, { eager: true })
  statut: ProduitStatut;

  @OneToMany(() => ProduitImage, (image) => image.produit, { cascade: true })
  images: ProduitImage[];
}
