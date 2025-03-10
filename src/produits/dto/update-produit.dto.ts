import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateProduitDto {
  @ApiPropertyOptional({ example: 'Mon Produit Modifié' })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional({ example: 'Nouvelle description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 89.99 })
  @IsNumber()
  @IsOptional()
  prix?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 2, description: 'Nouvelle catégorie' })
  @IsNumber()
  @IsOptional()
  categorie_id?: number;

  @ApiPropertyOptional({ example: 2, description: 'Nouveau statut' })
  @IsNumber()
  @IsOptional()
  statut_id?: number;

  @ApiPropertyOptional({ example: 2, description: 'Nouvelle promotion' })
  @IsNumber()
  @IsOptional()
  promotion_id?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Mise à jour des URLs des images du produit',
    example: ['https://example.com/img3.jpg', 'https://example.com/img4.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'actif', description: 'Etat du produit' })
  @IsOptional()
  @IsString()
  etat?: string;
}
