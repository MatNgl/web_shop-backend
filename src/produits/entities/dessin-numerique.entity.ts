import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dessins_numeriques')
export class DessinNumerique {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @Column({ length: 50 })
  resolution: string; // ex: "1920x1080"

  @Column({ length: 50 })
  dimensions: string; // ex: "A4", "A3", etc.
}
