/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Panier } from 'src/panier/entities/panier.entity';
import { Commande } from 'src/commandes/entities/commande.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prenom: string;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  // Relation bidirectionnelle vers Panier
  @OneToMany(() => Panier, (panier) => panier.user)
  paniers: Panier[];

  @OneToMany(() => Commande, (commande) => commande.user)
  commandes: Commande[];
  adresses: any;
  wishlists: any;
}
