/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/wishlist/wishlist.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { Produit } from 'src/produits/entities/produit.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
  ) {}

  // Récupère ou crée la wishlist d'un utilisateur
  async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.produit'],
    });
    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { id: userId } as any,
        items: [],
      });
      wishlist = await this.wishlistRepository.save(wishlist);
    }
    return wishlist;
  }

  // Ajouter un produit à la wishlist
  async addProductToWishlist(
    userId: number,
    addWishlistItemDto: AddWishlistItemDto,
  ): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const produit = await this.produitRepository.findOne({
      where: { id: addWishlistItemDto.produitId },
    });
    if (!produit) {
      throw new NotFoundException(
        `Produit #${addWishlistItemDto.produitId} introuvable`,
      );
    }
    // Vérifie si le produit n'est pas déjà dans la wishlist
    const existant = wishlist.items.find(
      (item) => item.produit.id === produit.id,
    );
    if (existant) {
      return wishlist; // Le produit est déjà dans la wishlist
    }
    const wishlistItem = this.wishlistItemRepository.create({
      produit,
      wishlist,
    });
    wishlist.items.push(wishlistItem);
    return await this.wishlistRepository.save(wishlist);
  }

  // Supprimer un item de la wishlist
  async removeProductFromWishlist(
    userId: number,
    itemId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const item = wishlist.items.find((item) => item.id === itemId);
    if (!item) {
      throw new NotFoundException(
        `Item #${itemId} non trouvé dans la wishlist`,
      );
    }
    wishlist.items = wishlist.items.filter((i) => i.id !== itemId);
    await this.wishlistItemRepository.delete(itemId);
    return await this.wishlistRepository.save(wishlist);
  }

  // Récupérer la wishlist de l'utilisateur
  async getWishlist(userId: number): Promise<Wishlist> {
    return await this.getOrCreateWishlist(userId);
  }
}
