// src/produits/dto/create-produit.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
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

  @ApiPropertyOptional({
    example: [1],
    description: 'Liste des IDs de promotions associées au produit',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  promotion_ids?: number[];

  @ApiPropertyOptional({
    description: 'Tableau d’URLs (optionnel si vous gérez l’upload)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: true, description: 'Etat du produit' })
  @IsBoolean()
  etat: boolean;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Liste des IDs de sous-catégories associées au produit',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  sousCategorieIds?: number[];
}
