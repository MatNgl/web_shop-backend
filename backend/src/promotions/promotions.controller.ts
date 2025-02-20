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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // Consultation accessible à tous
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les promotions' })
  @ApiResponse({ status: 200, description: 'Liste des promotions.' })
  async findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une promotion par son ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la promotion' })
  @ApiResponse({
    status: 200,
    description: 'La promotion correspondant à l’ID.',
  })
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  // Endpoints réservés aux administrateurs
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer une nouvelle promotion (admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Promotion créée avec succès.' })
  @ApiBody({ type: CreatePromotionDto })
  async create(@Body() createPromotionDto: CreatePromotionDto, @Request() req) {
    return this.promotionsService.create(createPromotionDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour une promotion (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la promotion' })
  @ApiResponse({
    status: 200,
    description: 'Promotion mise à jour avec succès.',
  })
  @ApiBody({ type: UpdatePromotionDto })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @Request() req,
  ) {
    return this.promotionsService.update(+id, updatePromotionDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer une promotion (admin uniquement)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la promotion' })
  @ApiResponse({ status: 200, description: 'Promotion supprimée avec succès.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.promotionsService.remove(+id, req.user);
    return { message: `Promotion #${id} supprimée` };
  }
}
