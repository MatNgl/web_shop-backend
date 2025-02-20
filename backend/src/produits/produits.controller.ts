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
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Produits')
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  // Endpoint accessible à tous pour la consultation
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiResponse({ status: 200, description: 'Liste de produits.' })
  async findAll() {
    return this.produitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Le produit correspondant à l’ID.' })
  async findOne(@Param('id') id: string) {
    return this.produitsService.findOne(+id);
  }

  // Endpoints réservés aux administrateurs
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un nouveau produit (admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès.' })
  @ApiBody({ type: CreateProduitDto })
  async create(@Body() createProduitDto: CreateProduitDto, @Request() req) {
    return this.produitsService.create(createProduitDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un produit (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit supprimé avec succès.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.produitsService.remove(+id, req.user);
    return { message: `Produit #${id} supprimé` };
  }
}
