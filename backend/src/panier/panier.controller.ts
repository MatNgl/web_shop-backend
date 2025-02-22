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
  BadRequestException,
} from '@nestjs/common';
import { PanierService } from './panier.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddProductDto } from './dto/add-product.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { Panier } from './entities/panier.entity';

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
}
