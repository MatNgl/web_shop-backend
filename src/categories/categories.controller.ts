import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProduitsService } from 'src/produits/produits.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateSousCategorieDto } from './dto/create-sous-categorie.dto';
import { UpdateSousCategorieDto } from './dto/update-sous-categorie.dto';

@ApiTags('Catégories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly produitsService: ProduitsService,
  ) {}

  // Récupérer toutes les catégories
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  @ApiResponse({ status: 200, description: 'Liste des catégories.' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  // Récupérer une catégorie par son ID
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'La catégorie correspondant à l’ID.',
  })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // Créer une nouvelle catégorie (admin uniquement) en intégrant l'état
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Catégorie A' },
        description: { type: 'string', example: 'Description de la catégorie' },
        etat: { type: 'boolean', example: true },
      },
      required: ['nom', 'etat'],
    },
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Mettre à jour une catégorie (admin uniquement) en intégrant l'état
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour une catégorie (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour avec succès.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Catégorie Modifiée' },
        description: { type: 'string', example: 'Nouvelle description' },
        etat: { type: 'boolean', example: true },
      },
      required: ['etat'],
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  // Supprimer une catégorie (admin uniquement)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer une catégorie (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée avec succès.' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(+id);
    return { message: `Catégorie #${id} supprimée` };
  }

  // Récupérer les sous-catégories associées à une catégorie
  @Get(':id/subcategories')
  @ApiOperation({
    summary: 'Récupérer les sous-catégories associées à une catégorie',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Liste des sous-catégories de la catégorie.',
  })
  async getSubCategories(@Param('id') id: string) {
    return this.categoriesService.getSubCategories(+id);
  }

  // Créer une sous-catégorie pour une catégorie donnée (admin uniquement)
  @UseGuards(JwtAuthGuard)
  @Post(':id/subcategories')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Créer une sous-catégorie pour une catégorie donnée (admin uniquement)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la catégorie parent',
  })
  @ApiBody({ type: CreateSousCategorieDto })
  @ApiResponse({
    status: 201,
    description: 'Sous-catégorie créée avec succès.',
  })
  async createSubCategory(
    @Param('id') id: string,
    @Body() createSousCategorieDto: CreateSousCategorieDto,
  ) {
    return this.categoriesService.createSubCategory(
      +id,
      createSousCategorieDto,
    );
  }

  // Mettre à jour une sous-catégorie (admin uniquement)
  @UseGuards(JwtAuthGuard)
  @Patch('subcategories/:subId')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mettre à jour une sous-catégorie (admin uniquement)',
  })
  @ApiParam({
    name: 'subId',
    type: 'number',
    description: 'ID de la sous-catégorie',
  })
  @ApiBody({ type: UpdateSousCategorieDto })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie mise à jour avec succès.',
  })
  async updateSubCategory(
    @Param('subId') subId: string,
    @Body() updateSousCategorieDto: UpdateSousCategorieDto,
  ) {
    return this.categoriesService.updateSubCategory(
      +subId,
      updateSousCategorieDto,
    );
  }

  // Supprimer une sous-catégorie (admin uniquement)
  @UseGuards(JwtAuthGuard)
  @Delete('subcategories/:subId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer une sous-catégorie (admin uniquement)' })
  @ApiParam({
    name: 'subId',
    type: 'number',
    description: 'ID de la sous-catégorie',
  })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie supprimée avec succès.',
  })
  async removeSubCategory(@Param('subId') subId: string) {
    await this.categoriesService.removeSubCategory(+subId);
    return { message: `Sous-catégorie #${subId} supprimée` };
  }

  // Récupérer les produits associés à une catégorie
  @Get(':id/products')
  @ApiOperation({
    summary: 'Récupérer les produits associés à une catégorie',
    description:
      'Renvoie la liste des produits dont la catégorie correspond à l’ID fourni.',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits associés à la catégorie.',
  })
  async findProductsByCategory(@Param('id') id: string) {
    return await this.produitsService.findByCategory(+id);
  }
}
