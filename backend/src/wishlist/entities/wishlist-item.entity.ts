// src/wishlist/entities/wishlist-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Produit } from 'src/produits/entities/produit.entity';

@Entity()
export class WishlistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Produit, { eager: true })
  produit: Produit;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items)
  wishlist: Wishlist;

  @CreateDateColumn()
  added_at: Date;
}
