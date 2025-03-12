// entities/inventaire.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventaire')
export class Inventaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  produit_id: number;

  @Column({ type: 'int' })
  quantite: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updated_at: Date;
}
