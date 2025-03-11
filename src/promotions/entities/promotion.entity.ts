import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { PromotionType } from '../enums/promotion-type.enum';
import { PromotionScope } from '../enums/promotion-scope.enum';
import { Produit } from 'src/produits/entities/produit.entity';

@Entity('promotion')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date_debut: Date;

  @Column({ type: 'date' })
  date_fin: Date;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
    nullable: false,
    default: PromotionType.POURCENTAGE,
  })
  promotion_type: PromotionType;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  promotion_valeur: number;

  @Column({
    type: 'enum',
    enum: PromotionScope,
    nullable: false,
    default: PromotionScope.PRODUIT,
  })
  scope: PromotionScope;

  @Column({ type: 'int', nullable: true, default: 99999999 })
  usage_limit: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  usage_count: number;

  @Column({ type: 'boolean', default: true })
  etat: boolean;

  // Relation ManyToMany avec Produit
  @ManyToMany(() => Produit, (produit) => produit.promotions)
  produits: Produit[];
}
