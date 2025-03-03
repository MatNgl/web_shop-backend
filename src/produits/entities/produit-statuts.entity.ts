import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Produit } from './produit.entity';

@Entity('produit_statut')
export class ProduitStatut {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  @ManyToMany(() => Produit, (produit) => produit.statuts)
  produits: Produit[];
}
