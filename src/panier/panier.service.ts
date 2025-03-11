import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Panier } from './entities/panier.entity';
import { ArticlePanier } from './entities/article-panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { CommandesService } from 'src/commandes/commandes.service';
import { CreateCommandeDto } from 'src/commandes/dto/create-commande.dto';

@Injectable()
export class PanierService {
  constructor(
    @InjectRepository(Panier)
    private readonly panierRepository: Repository<Panier>,
    @InjectRepository(ArticlePanier)
    private readonly articlePanierRepository: Repository<ArticlePanier>,
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
    private readonly commandesService: CommandesService,
  ) {}

  async getOrCreatePanier(userId: number): Promise<Panier> {
    let panier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
      relations: ['articles', 'articles.produit'],
    });
    if (!panier) {
      panier = this.panierRepository.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: { id: userId } as any,
      });
      panier = await this.panierRepository.save(panier);
    }
    return panier;
  }

  async addProductToPanier(
    user: UserPayload,
    produitId: number,
    quantite: number,
  ): Promise<Panier> {
    const panier = await this.getOrCreatePanier(user.id);

    const produit = await this.produitRepository.findOne({
      where: { id: produitId },
    });
    if (!produit) {
      throw new NotFoundException(`Produit #${produitId} introuvable`);
    }
    // Vérifier que le produit est actif
    if (!produit.etat) {
      throw new BadRequestException(
        `Produit #${produitId} n'est pas disponible`,
      );
    }

    if (quantite > (produit.stock ?? 0)) {
      throw new BadRequestException(
        `Stock insuffisant pour le produit #${produitId}, disponible: ${produit.stock ?? 0}`,
      );
    }

    let article = panier.articles.find((a) => a.produit.id === produitId);
    if (article) {
      if (article.quantite + quantite > (produit.stock ?? 0)) {
        throw new BadRequestException(
          `Quantité totale dépasse le stock disponible. Disponible: ${produit.stock ?? 0}`,
        );
      }
      article.quantite += quantite;
    } else {
      article = this.articlePanierRepository.create({
        produit,
        quantite,
        panier,
      });
      panier.articles.push(article);
    }

    return await this.panierRepository.save(panier);
  }

  async updateArticleQuantity(
    user: UserPayload,
    articleId: number,
    quantite: number,
  ): Promise<Panier> {
    const panier = await this.getOrCreatePanier(user.id);

    const article = panier.articles.find((a) => a.id === articleId);
    if (!article) {
      throw new NotFoundException(
        `Article #${articleId} introuvable dans le panier`,
      );
    }

    if (quantite > (article.produit.stock ?? 0)) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${article.produit.stock ?? 0}`,
      );
    }

    article.quantite = quantite;

    return await this.panierRepository.save(panier);
  }

  async removeArticle(user: UserPayload, articleId: number): Promise<Panier> {
    let panier = await this.getOrCreatePanier(user.id);

    panier.articles = panier.articles.filter((a) => a.id !== articleId);

    panier = await this.panierRepository.save(panier);
    await this.articlePanierRepository.delete(articleId);

    return panier;
  }

  async getPanier(user: UserPayload): Promise<Panier> {
    return await this.getOrCreatePanier(user.id);
  }

  async viderPanier(user: UserPayload): Promise<void> {
    const panier = await this.getOrCreatePanier(user.id);
    if (!panier.articles.length) return;

    await this.articlePanierRepository.delete({ panier: { id: panier.id } });
  }

  async validatePanier(
    user: UserPayload,
    shippingAddress: string,
    paymentMethod: string,
  ) {
    const panier = await this.getOrCreatePanier(user.id);

    if (!panier.articles || panier.articles.length === 0) {
      throw new BadRequestException(
        'Votre panier est vide, vous ne pouvez pas passer commande.',
      );
    }

    const createCommandeDto: CreateCommandeDto = {
      userId: user.id,
      shippingAddress,
      paymentMethod,
    };

    const commande = await this.commandesService.create(createCommandeDto);

    // Vider le panier après la validation
    await this.viderPanier(user);

    return commande;
  }
}
