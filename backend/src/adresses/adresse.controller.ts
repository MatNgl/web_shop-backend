import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdresseService } from './adresse.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Adresses')
@Controller('adresses')
export class AdresseController {
  constructor(private readonly adresseService: AdresseService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  getAdresses(@Request() req) {
    return this.adresseService.getAdresses(req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  ajouterAdresse(@Request() req, @Body() body) {
    return this.adresseService.ajouterAdresse(req.user, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  modifierAdresse(@Param('id') id: number, @Body() body) {
    return this.adresseService.modifierAdresse(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  supprimerAdresse(@Param('id') id: number) {
    return this.adresseService.supprimerAdresse(id);
  }
}
