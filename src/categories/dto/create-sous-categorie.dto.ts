import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSousCategorieDto {
  @ApiProperty({ example: 'Sous-catégorie A' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'Description de la sous-catégorie A' })
  @IsString()
  @IsOptional()
  description?: string;
}
