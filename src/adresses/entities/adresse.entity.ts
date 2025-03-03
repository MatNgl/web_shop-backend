/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity('adresse')
export class Adresse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.adresses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  rue: string;

  @Column()
  ville: string;

  @Column()
  codePostal: string;

  @Column()
  pays: string;
}
