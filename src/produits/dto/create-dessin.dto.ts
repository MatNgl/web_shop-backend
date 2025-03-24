import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateDessinDto {
  // Champs communs au produit
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  etat: boolean;

  @IsNotEmpty()
  @IsNumber()
  categorie_id: number;

  @IsOptional()
  @IsNumber()
  promotionId?: number;

  // Nouveau champ : stock spécifique au dessin
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  // Champs spécifiques au dessin
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
  prix: number;

  // Optionnel : liste d'URL des images associées
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // Ajout de la propriété sousCategorieIds
  // @IsOptional()
  // @IsArray()
  // @IsNumber({}, { each: true })
  // sousCategorieIds?: number[];
}
