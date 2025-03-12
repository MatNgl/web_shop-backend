// src/produits/entities/sticker.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sticker')
export class Sticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @Column({ length: 50 })
  format: string; // Ex. "rond", "carré", "rectangulaire"

  @Column({ length: 50 })
  dimensions: string; // Ex. "10x10cm", "5x7cm", etc.

  @Column({ length: 50 })
  support: string; // Ici, nous stockons la valeur de "materiau"
}
