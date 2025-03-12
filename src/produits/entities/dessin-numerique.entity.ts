// src/produits/entities/dessin-numerique.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dessins_numeriques')
export class DessinNumerique {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @Column({ length: 50 })
  format: string; // Ici, nous stockons la résolution (ex. "1920x1080")

  @Column({ length: 50 })
  dimensions: string; // Ex. "A4", "A3", etc.

  @Column({ length: 255, nullable: true })
  support?: string;
}
