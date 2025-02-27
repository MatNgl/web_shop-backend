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
  
    @Column()
    shippingAddress: string;
  
    @Column()
    paymentMethod: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @ManyToOne(() => User, (user) => user.commandes, { eager: true })
    user: User;
  }
  