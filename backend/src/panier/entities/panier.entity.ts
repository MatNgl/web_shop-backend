// src/panier/entities/panier.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { ArticlePanier } from './article-panier.entity';

@Entity('panier')
export class Panier {
  @PrimaryGeneratedColumn()
  id: number;

  // Lien vers l’utilisateur propriétaire du panier
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, (user) => user.paniers, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relation vers les articles du panier
  @OneToMany(() => ArticlePanier, (article) => article.panier, {
    cascade: true,
  })
  articles: ArticlePanier[];
}
