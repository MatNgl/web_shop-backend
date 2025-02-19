/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Patch, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mettre à jour le profil de l’utilisateur',
    description:
      'Modifie les informations personnelles de l’utilisateur connecté. La mise à jour sera validée uniquement si toutes les données sont conformes, notamment un téléphone à 10 chiffres.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès.' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description:
      'Permet à l’utilisateur connecté de modifier son mot de passe en fournissant l’ancien mot de passe, le nouveau et sa confirmation.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis à jour avec succès.',
  })
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Suppression du compte',
    description: 'Supprime le compte de l’utilisateur connecté.',
  })
  @ApiResponse({ status: 200, description: 'Compte supprimé avec succès.' })
  async deleteAccount(@Request() req) {
    await this.usersService.deleteUser(req.user.id);
    return { message: 'Compte supprimé avec succès.' };
  }
}
