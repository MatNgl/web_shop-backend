import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('categorie')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  etat: boolean;
}
