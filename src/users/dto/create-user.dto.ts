import { IsEmail, IsString, Matches, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice', description: 'Prénom de l’utilisateur' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'Martin', description: 'Nom de l’utilisateur' })
  @IsString()
  nom: string;

  @ApiProperty({
    example: 'alice.martin@example.com',
    description: 'Adresse email de l’utilisateur',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'motdepasse123',
    description: 'Mot de passe de l’utilisateur',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: '0123456789',
    description: 'Numéro de téléphone de l’utilisateur (10 chiffres)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Le téléphone doit comporter exactement 10 chiffres',
  })
  telephone?: string;

  @ApiProperty({
    example: 'user',
    description: 'Rôle de l’utilisateur (user ou admin)',
  })
  @IsString()
  @IsIn(['user', 'admin'], {
    message: 'Le rôle doit être soit "user" soit "admin"',
  })
  role: string;
}
