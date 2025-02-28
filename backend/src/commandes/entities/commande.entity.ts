/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()
export class Commande {
  @PrimaryGeneratedColumn()
  id: number;

  // Rendre ces champs optionnels pour pouvoir créer la commande sans ces infos initialement
  @Column({ nullable: true })
  shippingAddress?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  // Statut de la commande : "pending" par défaut puis "validated" quand les infos sont complètes
  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.commandes, { eager: true })
  user: User;
}
