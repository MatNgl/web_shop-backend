import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SousCategorie } from './sous-categorie.entity';

@Entity('categorie')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => SousCategorie, (sousCategorie) => sousCategorie.categorie)
  sousCategories: SousCategorie[];
}
