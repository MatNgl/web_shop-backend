import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('produit_details')
export class ProduitDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  produit_id: number;

  @Column({ length: 50 })
  format: string; // pour un dessin : la résolution, pour un sticker : la forme

  @Column({ length: 50 })
  dimensions: string; // par exemple "A4" ou "10x10cm"

  @Column({ length: 255, nullable: true })
  support?: string; // ex: "vinyle" (obligatoire pour un sticker, optionnel sinon)
}
