/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'motdepasse123', description: 'Ancien mot de passe' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'nouveauMotdepasse456', description: 'Nouveau mot de passe (minimum 6 caractères)' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: 'nouveauMotdepasse456', description: 'Confirmation du nouveau mot de passe' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
