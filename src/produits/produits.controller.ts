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
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { ProduitsService } from './produits.service';

@ApiTags('Produits')
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  // Création d'un produit avec ses variantes
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un produit (admin uniquement)' })
  @ApiBody({ type: CreateProduitDto })
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
