import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sticker')
export class Sticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @Column({ length: 50 })
  format: string; // ex. "rond", "carré", "rectangulaire"

  @Column({ length: 50 })
  dimensions: string; // ex. "10x10cm", "5x7cm", etc.

  @Column({ length: 50 })
  materiau: string; // ex. "vinyle", "papier", etc.
}
