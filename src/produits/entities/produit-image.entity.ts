import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Produit } from './produit.entity';

@Entity('produit_images')
export class ProduitImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  added_at: Date;

  @ManyToOne(() => Produit, (produit) => produit.images, {
    onDelete: 'CASCADE',
  })
  produit: Produit;
}
