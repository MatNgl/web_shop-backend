import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Produit } from 'src/produits/entities/produit.entity';

@Entity('sous_categorie')
export class SousCategorie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  etat: boolean;

  @ManyToOne(() => Category, (category) => category.sousCategories, {
    onDelete: 'CASCADE',
  })
  categorie: Category;

  @ManyToMany(() => Produit, (produit) => produit.sousCategories)
  produits: Produit[];
}
