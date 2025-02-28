/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/commandes/entities/commande.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  EN_COURS = 'en cours',
  EXPEDIEE = 'expediee',
  LIVREE = 'livree',
  ANNULEE = 'annulee',
}

export enum PaymentStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  ECHOUE = 'echoue',
}

export enum ShippingStatus {
  PREPARATION = 'preparation',
  EXPEDIEE = 'expediee',
  LIVREE = 'livree',
}

@Entity()
export class Commande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  shippingAddress?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  // Statut de la commande (défaut "pending")
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  // Statut de paiement (défaut "pending")
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  // Statut de livraison (défaut "preparation")
  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PREPARATION,
  })
  shippingStatus: ShippingStatus;

  // Frais de port (calculés en fonction de la commande)
  @Column({ type: 'decimal', nullable: true })
  shippingCost?: number;

  // Date d'expédition effective (optionnelle)
  @Column({ type: 'timestamp', nullable: true })
  expeditionDate?: Date;

  // Date estimée de livraison (optionnelle)
  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.commandes, { eager: true })
  user: User;
}
