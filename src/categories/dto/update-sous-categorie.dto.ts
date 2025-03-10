import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSousCategorieDto {
  @ApiPropertyOptional({ example: 'Sous-catégorie mise à jour' })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional({ example: 'Nouvelle description de la sous-catégorie' })
  @IsString()
  @IsOptional()
  description?: string;
}
