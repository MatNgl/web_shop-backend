import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Produit } from './produit.entity';

@Entity('details')
export class Detail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @ManyToOne(() => Produit, (produit) => produit.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  @Column({ type: 'varchar', length: 100 })
  format: string;

  @Column({ type: 'varchar', length: 100 })
  dimensions: string;

  @Column({ type: 'varchar', length: 100 })
  support: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  prix: number;

  @Column({ type: 'int' })
  stock: number;
}
