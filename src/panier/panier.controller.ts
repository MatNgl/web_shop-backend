/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/panier/panier.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PanierService } from './panier.service';
import { ValidatePanierDto } from './dto/validate-panier.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AddProductDto } from './dto/add-product.dto';

@ApiTags('Panier')
@Controller('panier')
export class PanierController {
  constructor(private readonly panierService: PanierService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Récupérer le panier de l’utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Retourne le panier et ses articles.',
    schema: {
      example: {
        id: 1,
        user: { id: 3, email: 'user@example.com' },
        created_at: '2025-02-22T12:00:00Z',
        updated_at: '2025-02-22T12:30:00Z',
        articles: [
          {
            id: 1,
            produit: { id: 5, nom: 'Tableau Abstrait', prix: 200 },
            quantite: 2,
          },
        ],
      },
    },
  })
  async getPanier(@Request() req) {
    return this.panierService.getPanier(req.user);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ajouter un produit au panier' })
  @ApiBody({
    description: 'Les détails du produit à ajouter',
    type: AddProductDto,
    examples: {
      exemple1: {
        summary: 'Ajout standard',
        value: {
          produitId: 5,
          quantite: 2,
        },
      },
      exemple2: {
        summary: 'Ajout d’un produit unique',
        value: {
          produitId: 8,
          quantite: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Retourne le panier mis à jour.',
    schema: {
      example: {
        id: 1,
        user: { id: 3, email: 'user@example.com' },
        articles: [
          {
            id: 1,
            produit: { id: 5, nom: 'Tableau Abstrait', prix: 200 },
            quantite: 2,
          },
        ],
      },
    },
  })
  async addProductToPanier(@Request() req, @Body() body: AddProductDto) {
    return this.panierService.addProductToPanier(
      req.user,
      body.produitId,
      body.quantite,
    );
  }

  @Patch('update-quantity/:articleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour la quantité d’un article' })
  @ApiBody({
    description: 'Les détails de la mise à jour de quantité',
    type: UpdateQuantityDto,
    examples: {
      exemple1: {
        summary: 'Mettre la quantité à 5',
        value: {
          quantite: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Retourne le panier mis à jour avec la nouvelle quantité.',
    schema: {
      example: {
        id: 1,
        user: { id: 3, email: 'user@example.com' },
        articles: [
          {
            id: 1,
            produit: { id: 5, nom: 'Tableau Abstrait', prix: 200 },
            quantite: 5,
          },
        ],
      },
    },
  })
  async updateArticleQuantity(
    @Request() req,
    @Param('articleId') articleId: number,
    @Body() body: UpdateQuantityDto,
  ) {
    return this.panierService.updateArticleQuantity(
      req.user,
      articleId,
      body.quantite,
    );
  }

  @Delete('remove/:articleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un article du panier' })
  @ApiResponse({
    status: 200,
    description: 'Retourne le panier mis à jour sans l’article supprimé.',
    schema: {
      example: {
        id: 1,
        user: { id: 3, email: 'user@example.com' },
        articles: [],
      },
    },
  })
  async removeArticle(@Request() req, @Param('articleId') articleId: number) {
    return this.panierService.removeArticle(req.user, articleId);
  }

  // Nouveau endpoint pour vider le panier
  @Delete('empty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Vider le panier' })
  @ApiResponse({
    status: 200,
    description: 'Panier vidé avec succès.',
    schema: { example: { message: 'Panier vidé' } },
  })
  async emptyPanier(@Request() req) {
    await this.panierService.viderPanier(req.user);
    return { message: 'Panier vidé' };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Valider le panier et créer une commande' })
  @ApiBody({ type: ValidatePanierDto })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès.' })
  async validatePanier(
    @Request() req,
    @Body() validatePanierDto: ValidatePanierDto,
  ) {
    return this.panierService.validatePanier(
      req.user,
      validatePanierDto.shippingAddress,
      validatePanierDto.paymentMethod,
    );
  }
}
