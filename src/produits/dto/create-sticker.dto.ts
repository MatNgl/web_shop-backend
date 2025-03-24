import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStickerDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  etat: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categorie_id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  promotionId?: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  stock: number;

  @IsNotEmpty()
  @IsString()
  format: string;

  @IsNotEmpty()
  @IsString()
  dimensions: string;

  @IsNotEmpty()
  @IsString()
  support: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  prix: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // @ApiPropertyOptional({
  //   description: 'Liste des IDs de sous-catégories associées au produit',
  //   type: 'array',
  //   items: { type: 'number' },
  //   example: [1, 2],
  // })
  // @IsOptional()
  // @IsArray()
  // @Type(() => Number)
  // @IsNumber({}, { each: true })
  // sousCategorieIds?: number[];
}
