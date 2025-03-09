import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateProduitDto {
  @ApiProperty({ example: 'Mon Produit' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'Ceci est la description du produit' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Type(() => Number)
  prix: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  categorie_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  statut_id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  promotion_id?: number;

  @ApiPropertyOptional({
    description: 'Tableau d’URLs (optionnel si vous gérez l’upload)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
