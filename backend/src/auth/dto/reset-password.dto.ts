import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'votreTokenIci',
    description: 'Token de réinitialisation reçu par email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'nouveauMotdepasse456',
    description: 'Nouveau mot de passe (minimum 6 caractères)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    example: 'nouveauMotdepasse456',
    description: 'Confirmation du nouveau mot de passe',
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
