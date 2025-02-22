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
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
  // Nouvel endpoint pour la recherche par nom
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

  // Endpoints réservés aux administrateurs
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un nouveau produit (admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès.' })
  @ApiBody({ type: CreateProduitDto })
  async create(@Body() createProduitDto: CreateProduitDto, @Request() req) {
    return this.produitsService.create(createProduitDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour un produit (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour avec succès.' })
  @ApiBody({ type: UpdateProduitDto })
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
