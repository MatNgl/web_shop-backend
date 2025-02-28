import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Commandes')
@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès.' })
  async create(@Body() createCommandeDto: CreateCommandeDto) {
    return this.commandesService.create(createCommandeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commandes' })
  @ApiResponse({ status: 200, description: 'Liste des commandes.' })
  async findAll() {
    return this.commandesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID' })
  @ApiResponse({ status: 200, description: 'Commande trouvée.' })
  async findOne(@Param('id') id: number) {
    return this.commandesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une commande (adresse, paiement puis validation)',
  })
  @ApiResponse({ status: 200, description: 'Commande mise à jour.' })
  async update(
    @Param('id') id: number,
    @Body() updateCommandeDto: UpdateCommandeDto,
  ) {
    return this.commandesService.update(id, updateCommandeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande' })
  @ApiResponse({ status: 200, description: 'Commande supprimée.' })
  async remove(@Param('id') id: number) {
    return this.commandesService.remove(id);
  }
}
