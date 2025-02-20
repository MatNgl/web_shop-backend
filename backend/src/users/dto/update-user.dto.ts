import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Alice',
    description: 'Prénom de l’utilisateur',
  })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional({
    example: 'Martin',
    description: 'Nom de l’utilisateur',
  })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({
    example: 'user',
    description: "Role de l 'utiliateur",
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: 'alice.martin@example.com',
    description: 'Adresse email de l’utilisateur',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
}
