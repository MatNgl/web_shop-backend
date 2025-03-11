/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }

  async register(createUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Méthode pour "mot de passe oublié"
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // On ne révèle pas si l'utilisateur existe ou non pour des raisons de sécurité
    if (!user) {
      return {
        message:
          'Si un compte existe, un email de réinitialisation sera envoyé.',
      };
    }
    // Générer un token aléatoire
    const token = crypto.randomBytes(32).toString('hex');
    // Définir une expiration (416 jours)
    const expiry = new Date(Date.now() + 3600);
    // Mettre à jour l'utilisateur avec le token et sa date d'expiration
    await this.usersService.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expiry,
    });
    // Envoyer l'email (ici, on simule en faisant un console.log)
    console.log(
      `Email envoyé à ${email} avec le token de réinitialisation: ${token}`,
    );
    return {
      message: 'Si un compte existe, un email de réinitialisation sera envoyé.',
    };
  }

  // Méthode pour réinitialiser le mot de passe
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException(
        'Les mots de passe ne correspondent pas.',
      );
    }
    // Chercher l'utilisateur par token
    const user = await this.usersService.findByResetToken(token);
    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new UnauthorizedException('Le token est invalide ou a expiré.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Mettre à jour le mot de passe et supprimer le token
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    const { password: _unused, ...result } = user;
    return result;
  }
}
