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
import { CommandesService, CreateCommandePayload } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Commandes')
@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Créer une nouvelle commande (à partir d’un panier validé)',
  })
  @ApiBody({
    description:
      'Données nécessaires pour créer une commande (adresse de livraison et moyen de paiement). Le userId est récupéré automatiquement.',
    type: CreateCommandeDto,
    examples: {
      exemple1: {
        summary: 'Commande créée avec adresse et mode de paiement',
        value: {
          shippingAddress: '123 Rue de Paris, 75000 Paris',
          paymentMethod: 'Carte bancaire',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès.' })
  async create(@Body() createCommandeDto: CreateCommandeDto, @Request() req) {
    createCommandeDto.userId = req.user.id;
    return this.commandesService.create(createCommandeDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commandes (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des commandes avec leur statut.',
  })
  async findAll() {
    return this.commandesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID (admin)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "L'identifiant de la commande",
  })
  @ApiResponse({ status: 200, description: 'Commande trouvée.' })
  async findOne(@Param('id') id: number) {
    return this.commandesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une commande (adresse, paiement, statuts, suivi)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "L'identifiant de la commande à mettre à jour",
  })
  @ApiBody({
    description:
      'Données pour mettre à jour la commande, ex. modifier l’adresse, simuler le paiement ou mettre à jour les statuts.',
    type: UpdateCommandeDto,
    examples: {
      exemple1: {
        summary: 'Mise à jour avec validation de paiement et livraison',
        value: {
          shippingAddress: '456 Rue de Lyon, 69000 Lyon',
          paymentMethod: 'Paypal',
          orderStatus: 'validated',
          paymentStatus: 'validated',
          shippingStatus: 'expediee',
          shippingCost: 9.99,
          expeditionDate: '2025-03-01T10:00:00.000Z',
          estimatedDeliveryDate: '2025-03-05T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Commande mise à jour.' })
  async update(
    @Param('id') id: number,
    @Body() updateCommandeDto: UpdateCommandeDto,
  ) {
    return this.commandesService.update(id, updateCommandeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande (admin)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "L'identifiant de la commande à supprimer",
  })
  @ApiResponse({ status: 200, description: 'Commande supprimée.' })
  async remove(@Param('id') id: number) {
    return this.commandesService.remove(id);
  }
}
