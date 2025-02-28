/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer la wishlist de l’utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Liste des produits favoris.' })
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Ajouter un produit à la wishlist' })
  @ApiBody({
    description: 'Données pour ajouter un produit à la wishlist',
    type: AddWishlistItemDto,
    examples: {
      exemple1: {
        summary: 'Ajouter un produit',
        value: {
          produitId: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produit ajouté à la wishlist.' })
  async addProduct(
    @Request() req,
    @Body() addWishlistItemDto: AddWishlistItemDto,
  ) {
    return this.wishlistService.addProductToWishlist(
      req.user.id,
      addWishlistItemDto,
    );
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Supprimer un produit de la wishlist' })
  @ApiParam({
    name: 'itemId',
    type: Number,
    description: "L'identifiant de l'item à supprimer de la wishlist",
  })
  @ApiResponse({ status: 200, description: 'Produit supprimé de la wishlist.' })
  async removeProduct(@Request() req, @Param('itemId') itemId: number) {
    return this.wishlistService.removeProductFromWishlist(req.user.id, itemId);
  }
}
