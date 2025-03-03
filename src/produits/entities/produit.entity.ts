import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ProduitStatut } from './produit-statuts.entity';

@Entity('produit')
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column()
  categorie_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  promotion_id: number | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @ManyToMany(() => ProduitStatut, (produitStatut) => produitStatut.produits, {
    cascade: true,
  })
  @JoinTable({
    name: 'produit_statuts_produit',
    joinColumn: { name: 'produit_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'statut_id', referencedColumnName: 'id' },
  })
  statuts: ProduitStatut[];
}
