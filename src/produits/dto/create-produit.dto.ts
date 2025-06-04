/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/produits/dto/create-produit.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { CreateProduitDetailDto } from './create-produit-detail.dto';

export class CreateProduitDto {
  @ApiProperty({ example: 'Mon Produit' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'Description du produit' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  categorie_id: number;

  // Suppression de ProduitType car il n'est plus exporté depuis l'entité Produit
  @ApiPropertyOptional({
    example: 1,
    description:
      'ID de la promotion appliquée directement au produit (uniquement pour les promos de produit)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  promotion_id?: number;

  @ApiPropertyOptional({
    description: 'Tableau d’URLs (optionnel si vous gérez l’upload)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: true, description: 'Etat du produit' })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value.toLowerCase() === 'actif';
    }
    return value;
  })
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

  @ApiPropertyOptional({
    description: 'Variantes du produit',
    type: [CreateProduitDetailDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProduitDetailDto)
  details?: CreateProduitDetailDto[];
}
