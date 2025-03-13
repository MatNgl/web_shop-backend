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
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ProduitType } from '../entities/produit.entity';
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

  @ApiProperty({ example: ProduitType.AUTRE, enum: ProduitType })
  @IsEnum(ProduitType, {
    message: "Le type doit être 'dessin numérique', 'sticker' ou 'autre'",
  })
  type: ProduitType;

  // Promotion appliquée directement : un seul ID (optionnel)
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
    description:
      'Détails spécifiques du produit (si type est dessin numérique ou sticker)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProduitDetailDto)
  detail?: CreateProduitDetailDto;
}
