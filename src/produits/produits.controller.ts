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
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { UpdateProduitDetailDto } from './dto/update-produit-detail.dto';
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

  /**
   * Endpoint de création de produit.
   * Les données du produit sont envoyées en JSON (dans le body) et les images via le champ "files".
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un nouveau produit (admin uniquement)' })
  @ApiBody({
    description:
      'Créer un nouveau produit avec upload de plusieurs images et données JSON',
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Sticker Cool' },
        description: { type: 'string', example: 'Mon sticker super cool' },
        prix: { type: 'number', example: 15.99 },
        stock: { type: 'number', example: 200 },
        categorie_id: { type: 'number', example: 3 },
        // Ici, on attend un seul ID de promotion
        promotion_id: { type: 'number', example: 1 },
        type: {
          type: 'string',
          enum: ['dessin numérique', 'sticker', 'autre'],
          example: 'sticker',
        },
        etat: { type: 'boolean', example: true },
        sousCategorieIds: {
          type: 'object',
          items: { type: 'number' },
          example: [1, 2],
        },
        detail: {
          type: 'object',
          properties: {
            format: { type: 'string', example: 'rond' },
            dimensions: { type: 'string', example: '10x10cm' },
            support: { type: 'string', example: 'vinyle' },
          },
          example: {
            format: 'rond',
            dimensions: '10x10cm',
            support: 'vinyle',
          },
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Sélectionnez plusieurs images depuis votre explorateur de fichiers',
        },
      },
      required: [
        'nom',
        'description',
        'stock',
        'prix',
        'categorie_id',
        'type',
        'etat',
      ],
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

  @Patch(':id/detail')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mettre à jour les détails du produit (admin uniquement)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiBody({ type: UpdateProduitDetailDto })
  @ApiResponse({
    status: 200,
    description: 'Détails du produit mis à jour avec succès.',
  })
  async updateProduitDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetailDto: UpdateProduitDetailDto,
    @Request() req,
  ) {
    return this.produitsService.updateProduitDetail(
      id,
      updateDetailDto,
      req.user,
    );
  }

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
