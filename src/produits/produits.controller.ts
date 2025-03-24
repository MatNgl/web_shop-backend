/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { CreateDessinDto } from './dto/create-dessin.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { ProduitsService } from './produits.service';

@ApiTags('Produits')
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  // Endpoint spécifique pour créer un sticker
  @Post('sticker')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un sticker (admin uniquement)' })
  @ApiBody({
    description: 'Création d’un sticker avec images et données JSON',
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Sticker Cool' },
        description: { type: 'string', example: 'Un sticker super cool' },
        stock: { type: 'number', example: 200 },
        categorie_id: { type: 'number', example: 3 },
        promotion_id: { type: 'number', example: 1 },
        etat: { type: 'boolean', example: true },
        format: { type: 'string', example: 'rond' },
        dimensions: { type: 'string', example: '10x10cm' },
        support: { type: 'string', example: 'vinyle' },
        prix: { type: 'number', example: 15.99 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fichiers image',
        },
      },
      required: [
        'nom',
        'description',
        'stock',
        'categorie_id',
        'etat',
        'format',
        'dimensions',
        'support',
        'prix',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Sticker créé avec succès.' })
  async createSticker(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createStickerDto: CreateStickerDto,
    @Request() req,
  ) {
    const images = files.map((file) => `/uploads/${file.filename}`);
    createStickerDto.images = images;
    return this.produitsService.createSticker(createStickerDto, req.user);
  }

  // Endpoint spécifique pour créer un dessin
  @Post('dessin')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un dessin (admin uniquement)' })
  @ApiBody({
    description: 'Création d’un dessin avec images et données JSON',
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Dessin Méduse' },
        description: { type: 'string', example: 'Un dessin unique' },
        stock: { type: 'number', example: 50 },
        categorie_id: { type: 'number', example: 3 },
        promotion_id: { type: 'number', example: 1 },
        etat: { type: 'boolean', example: true },
        format: { type: 'string', example: 'A4' },
        dimensions: { type: 'string', example: '21x29.7cm' },
        support: { type: 'string', example: 'papier' },
        prix: { type: 'number', example: 49.99 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fichiers image',
        },
      },
      required: [
        'nom',
        'description',
        'stock',
        'categorie_id',
        'etat',
        'format',
        'dimensions',
        'support',
        'prix',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Dessin créé avec succès.' })
  async createDessin(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createDessinDto: CreateDessinDto,
    @Request() req,
  ) {
    const images = files.map((file) => `/uploads/${file.filename}`);
    createDessinDto.images = images;
    return this.produitsService.createDessin(createDessinDto, req.user);
  }

  // Autres endpoints généraux

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiResponse({ status: 200, description: 'Liste de produits.' })
  async findAll() {
    return this.produitsService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Rechercher des produits par nom',
    description:
      'Recherche des produits dont le nom contient le terme fourni (insensible à la casse).',
  })
  @ApiQuery({
    name: 'nom',
    type: 'string',
    description: 'Le terme à rechercher dans le nom du produit',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits correspondant au terme de recherche.',
  })
  async search(@Query('nom') nom: string) {
    return this.produitsService.searchByName(nom);
  }

  @Get('new')
  @ApiOperation({
    summary: 'Obtenir les nouveautés (produits créés il y a moins de 7 jours)',
  })
  async getNewProducts() {
    return this.produitsService.findNewProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Le produit correspondant à l’ID.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produitsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour un produit (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiBody({ type: UpdateProduitDto })
  @ApiResponse({ status: 200, description: 'Produit mis à jour avec succès.' })
  async update(
    @Param('id') id: string,
    @Body() updateProduitDto: UpdateProduitDto,
    @Request() req,
  ) {
    return this.produitsService.update(+id, updateProduitDto, req.user);
  }

  @Patch(':id/promotion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Appliquer ou retirer une promotion (admin uniquement)',
    description: 'Met à jour la promotion appliquée directement au produit.',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiBody({
    description:
      'Objet contenant le champ promotion_id (ou null pour retirer la promotion)',
    schema: {
      type: 'object',
      properties: {
        promotion_id: { type: 'number', example: 1 },
      },
      required: ['promotion_id'],
    },
  })
  @ApiResponse({ status: 200, description: 'Promotion appliquée avec succès.' })
  async applyPromotion(
    @Param('id') id: string,
    @Body('promotion_id') promotionId: number | null,
    @Request() req,
  ) {
    return await this.produitsService.applyPromotion(
      +id,
      promotionId,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un produit (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit supprimé avec succès.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.produitsService.remove(+id, req.user);
    return { message: `Produit #${id} supprimé` };
  }

  @Delete(':id/promotion/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Supprimer la promotion appliquée au produit (admin uniquement)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiParam({
    name: 'promotionId',
    type: 'number',
    description: 'ID de la promotion à retirer',
  })
  @ApiResponse({ status: 200, description: 'Promotion supprimée avec succès.' })
  async removePromotionFromProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Request() req,
  ) {
    return this.produitsService.removePromotionFromProduct(
      id,
      promotionId,
      req.user,
    );
  }

  @Get(':id/recommendations')
  @ApiOperation({
    summary: 'Obtenir des recommandations de produits basées sur la catégorie',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID du produit de référence',
  })
  async getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.produitsService.findRecommendedProducts(id);
  }

  @Get('promotions/active')
  @ApiOperation({
    summary: 'Afficher les produits avec une promotion active et disponibles',
  })
  async getProductsWithActivePromotion() {
    return this.produitsService.findProductsWithActivePromotion();
  }
}
