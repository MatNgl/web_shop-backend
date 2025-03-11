import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  TableInheritance,
} from 'typeorm';
import { ProduitImage } from './produit-image.entity';
import { ProduitStatut } from './produit-statuts.entity';
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

  @Column({ nullable: true })
  stock?: number;

  @Column()
  categorie_id: number;

  // Retirez la colonne promotion_id

  @Column({ default: true })
  etat: boolean;

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

  // Relation ManyToMany avec Promotion via la table promotion_produit
  @ManyToMany(() => Promotion, (promotion) => promotion.produits, {
    cascade: true,
  })
  @JoinTable({
    name: 'promotion_produit',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
  })
  promotions: Promotion[];

  // Relation avec SousCategorie via la table jointe "produit_sous_categorie"
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
