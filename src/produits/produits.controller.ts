// src/produits/produits.controller.ts
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
} from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Le produit correspondant à l’ID.' })
  async findOne(@Param('id') id: string) {
    return this.produitsService.findOne(+id);
  }

  // Création d'un produit avec upload de plusieurs images
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
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès.' })
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProduitDto: CreateProduitDto,
    @Request() req,
  ) {
    // Convertir chaque fichier uploadé en une URL relative, par ex: /uploads/filename.ext
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
}
