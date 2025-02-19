// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
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

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription d’un utilisateur',
    description:
      'Enregistre un nouvel utilisateur dans la base de données. Des données par défaut sont fournies pour faciliter les tests.',
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
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Profil complet de l’utilisateur',
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
        telephone: null,
        role: 'user',
        created_at: '2025-02-19T21:48:17.144Z',
        updated_at: '2025-02-19T21:48:17.144Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé. Le token est manquant ou invalide.',
  })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
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
  logout(@Request() req) {
    // Comme les JWT sont stateless, il n'est pas possible d'invalider le token côté serveur.
    // On se contente d'informer le client.
    return {
      message: 'Déconnexion réussie. Veuillez supprimer le token côté client.',
    };
  }
}
