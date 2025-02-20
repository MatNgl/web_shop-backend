/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/users/users.controller.ts
import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  Delete,
  Get,
} from '@nestjs/common';
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
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Récupération du profil',
    description:
      'Récupère toutes les informations de l’utilisateur connecté (sauf le mot de passe).',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil retourné avec succès.',
    schema: {
      example: {
        id: 1,
        prenom: 'Alice',
        nom: 'Martin',
        email: 'alice.martin@example.com',
        telephone: '0123456789',
        role: 'user',
        created_at: '2025-02-19T21:48:17.144Z',
        updated_at: '2025-02-19T21:48:17.144Z',
      },
    },
  })
  async getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.usersService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise à jour du profil',
    description:
      'Met à jour les informations de l’utilisateur connecté via une opération update. La mise à jour est validée uniquement si toutes les données sont conformes (par exemple, le téléphone doit comporter 10 chiffres).',
  })
  @ApiBody({
    description: 'Données à mettre à jour',
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Exemple de mise à jour',
        value: {
          prenom: 'Alice',
          nom: 'Martin',
          email: 'alice.martin@example.com',
          telephone: '0123456789',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès.' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise à jour du mot de passe',
    description:
      'Modifie le mot de passe de l’utilisateur connecté en validant l’ancien mot de passe et en s’assurant que le nouveau correspond à la confirmation.',
  })
  @ApiBody({
    description: 'Données pour la mise à jour du mot de passe',
    type: UpdatePasswordDto,
    examples: {
      default: {
        summary: 'Exemple de mise à jour du mot de passe',
        value: {
          oldPassword: 'ancienMotdepasse123',
          newPassword: 'nouveauMotdepasse456',
          confirmPassword: 'nouveauMotdepasse456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis à jour avec succès.',
  })
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.usersService.updatePassword(
      req.user.id,
      updatePasswordDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Suppression du compte',
    description:
      'Supprime le compte de l’utilisateur connecté via une opération delete.',
  })
  @ApiResponse({ status: 200, description: 'Compte supprimé avec succès.' })
  async deleteAccount(@Request() req) {
    await this.usersService.deleteUser(req.user.id);
    return { message: 'Compte supprimé avec succès.' };
  }
}
