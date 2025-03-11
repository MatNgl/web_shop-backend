/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { CreateDessinNumeriqueDto } from './dto/create-dessin-numerique.dto';
import { CreateStickerDto } from './dto/create-sticker.dto';
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';

@ApiTags('Produits')
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  // Récupérer tous les produits
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiResponse({ status: 200, description: 'Liste de produits.' })
  async findAll() {
    return this.produitsService.findAll();
  }

  // Rechercher des produits par nom
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

  // Obtenir les nouveautés (produits créés il y a moins de 7 jours)
  @Get('new')
  @ApiOperation({
    summary: 'Obtenir les nouveautés (produits créés il y a moins de 7 jours)',
  })
  async getNewProducts() {
    return this.produitsService.findNewProducts();
  }

  // Récupérer un produit par son ID
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Le produit correspondant à l’ID.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produitsService.findOne(id);
  }

  // Créer un nouveau produit (admin uniquement) avec upload d'images
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un nouveau produit (admin uniquement)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Mon Produit' },
        description: {
          type: 'string',
          example: 'Ceci est la description du produit',
        },
        prix: { type: 'number', example: 99.99 },
        stock: { type: 'number', example: 100 },
        categorie_id: { type: 'number', example: 1 },
        statut_id: { type: 'number', example: 1 },
        promotion_id: { type: 'number', example: 1 },
        etat: { type: 'boolean', example: true },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: ['nom', 'prix', 'categorie_id', 'etat'],
    },
  })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès.' })
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProduitDto: CreateProduitDto,
    @Request() req,
  ) {
    const images = files.map((file) => `/uploads/${file.filename}`);
    createProduitDto.images = images;
    return this.produitsService.create(createProduitDto, req.user);
  }

  // Créer un dessin numérique (admin uniquement) avec upload d'images
  @Post('dessin-numerique')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un dessin numérique (admin uniquement)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Dessin Digital' },
        description: {
          type: 'string',
          example: 'Description du dessin numérique',
        },
        prix: { type: 'number', example: 120.5 },
        stock: { type: 'number', example: 50 },
        categorie_id: { type: 'number', example: 2 },
        statut_id: { type: 'number', example: 1 },
        promotion_id: { type: 'number', example: 1 },
        resolution: { type: 'string', example: '1920x1080' },
        dimensions: { type: 'string', example: 'A4' },
        etat: { type: 'boolean', example: true },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: [
        'nom',
        'prix',
        'categorie_id',
        'resolution',
        'dimensions',
        'etat',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Dessin numérique créé avec succès.',
  })
  async createDessinNumerique(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createDessinDto: CreateDessinNumeriqueDto,
    @Request() req,
  ) {
    const images = files.map((file) => `/uploads/${file.filename}`);
    createDessinDto.images = images;
    return this.produitsService.createDessinNumerique(
      createDessinDto,
      req.user,
    );
  }

  // Créer un sticker (admin uniquement) avec upload d'images
  @Post('sticker')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un sticker (admin uniquement)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Sticker Cool' },
        description: { type: 'string', example: 'Description du sticker' },
        prix: { type: 'number', example: 15.99 },
        stock: { type: 'number', example: 200 },
        categorie_id: { type: 'number', example: 3 },
        statut_id: { type: 'number', example: 1 },
        promotion_id: { type: 'number', example: 1 },
        format: { type: 'string', example: 'rond' },
        dimensions: { type: 'string', example: '10x10cm' },
        materiau: { type: 'string', example: 'vinyle' },
        etat: { type: 'boolean', example: true },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: [
        'nom',
        'prix',
        'categorie_id',
        'format',
        'dimensions',
        'materiau',
        'etat',
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

  // Mettre à jour un produit existant (admin uniquement)
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

  // Supprimer un produit (admin uniquement)
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

  // Mettre à jour le stock d’un produit (admin uniquement)
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mettre à jour le stock d’un produit (admin uniquement)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiBody({
    description: 'Nouvelle quantité en stock',
    schema: {
      type: 'object',
      properties: {
        stock: { type: 'number', example: 150 },
      },
      required: ['stock'],
    },
  })
  @ApiResponse({ status: 200, description: 'Stock mis à jour avec succès.' })
  async updateStock(
    @Param('id') id: string,
    @Body('stock') stock: number,
    @Request() req,
  ) {
    return await this.produitsService.updateStock(+id, stock, req.user);
  }

  // Appliquer ou retirer une promotion sur un produit (admin uniquement)
  @Patch(':id/promotion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Appliquer ou retirer une promotion (admin uniquement)',
    description:
      'Met à jour le champ promotion_id du produit et recalcule ses statuts.',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiBody({
    description:
      'Objet contenant le champ promotion_id (ou null pour retirer la promotion)',
    schema: {
      type: 'object',
      properties: {
        promotion_id: { type: 'number', example: 2 },
      },
      required: ['promotion_id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion appliquée et statut mis à jour avec succès.',
  })
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

  // Obtenir des recommandations de produits basées sur la catégorie du produit de référence
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

  // Endpoint pour afficher les produits concernés par une promotion active et disponibles
  @Get('promotions/active')
  @ApiOperation({
    summary: 'Afficher les produits avec une promotion active et disponibles',
  })
  async getProductsWithActivePromotion() {
    return this.produitsService.findProductsWithActivePromotion();
  }

  @Delete(':id/promotion/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: "Supprimer une promotion d'un produit (admin uniquement)",
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiParam({
    name: 'promotionId',
    type: 'number',
    description: 'ID de la promotion à retirer',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion supprimée du produit avec succès.',
  })
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
}
