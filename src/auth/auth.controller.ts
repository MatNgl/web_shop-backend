/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription d’un utilisateur',
    description:
      'Enregistre un nouvel utilisateur dans la base de données. Vous pouvez choisir le rôle ("user" ou "admin").',
  })
  @ApiBody({
    description: 'Informations de l’utilisateur',
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Exemple de données',
        value: {
          prenom: 'Alice',
          nom: 'Martin',
          email: 'alice.martin@example.com',
          password: 'motdepasse123',
          telephone: '0123456789',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur enregistré avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur dans les données fournies.',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Connexion',
    description:
      'Connecte un utilisateur et retourne un token JWT. Les identifiants par défaut sont fournis pour faciliter les tests.',
  })
  @ApiBody({
    description: 'Identifiants de connexion',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'alice.martin@example.com' },
        password: { type: 'string', example: 'motdepasse123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie. Retourne un token JWT.',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Déconnexion',
    description:
      'Déconnecte l’utilisateur. Pour les JWT, cela signifie que le client doit supprimer le token.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Déconnexion réussie. Veuillez supprimer le token côté client.',
  })
  logout() {
    // Comme les JWT sont stateless, il n'est pas possible d'invalider le token côté serveur.
    // On se contente d'informer le client.
    return {
      message: 'Déconnexion réussie. Veuillez supprimer le token côté client.',
    };
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Mot de passe oublié',
    description:
      'Envoie un email de réinitialisation du mot de passe si le compte existe.',
  })
  @ApiBody({
    description: 'Email de l’utilisateur',
    type: ForgotPasswordDto,
    examples: {
      default: {
        summary: 'Exemple',
        value: { email: 'alice.martin@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Si le compte existe, un email de réinitialisation a été envoyé.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Réinitialisation du mot de passe',
    description:
      'Permet à l’utilisateur de réinitialiser son mot de passe en fournissant un token valide.',
  })
  @ApiBody({
    description: 'Token de réinitialisation et nouveau mot de passe',
    type: ResetPasswordDto,
    examples: {
      default: {
        summary: 'Exemple',
        value: {
          token: 'votreTokenIci',
          newPassword: 'nouveauMotdepasse456',
          confirmPassword: 'nouveauMotdepasse456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
