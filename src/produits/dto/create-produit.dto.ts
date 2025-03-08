// create-produit.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateProduitDto {
  @ApiProperty({ example: 'Mon Produit', description: 'Nom du produit' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 'Ceci est la description du produit',
    description: 'Description du produit',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 99.99, description: 'Prix du produit' })
  @IsNumber()
  prix: number;

  @ApiPropertyOptional({ example: 100, description: 'Quantité en stock' })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 1, description: 'ID de la catégorie' })
  @IsNumber()
  categorie_id: number;

  @ApiProperty({ example: 1, description: 'ID du statut du produit' })
  @IsNumber()
  statut_id: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la promotion associée (optionnel)',
  })
  @IsOptional()
  @IsNumber()
  promotion_id?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs des images associées au produit (optionnel)',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
