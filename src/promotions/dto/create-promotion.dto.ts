import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { PromotionType } from '../enums/promotion-type.enum';
import { PromotionScope } from '../enums/promotion-scope.enum';

export class CreatePromotionDto {
  @ApiProperty({ example: 'PROMO10', description: 'Code de promotion unique' })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Réduction de 10% sur une sélection d’articles',
    description: 'Description de la promotion',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-03-01',
    description: 'Date de début de la promotion (format YYYY-MM-DD)',
  })
  @IsDateString()
  date_debut: string;

  @ApiProperty({
    example: '2025-03-15',
    description: 'Date de fin de la promotion (format YYYY-MM-DD)',
  })
  @IsDateString()
  date_fin: string;

  @ApiProperty({
    example: 'POURCENTAGE',
    description: 'Type de promotion : POURCENTAGE ou MONTANT',
  })
  @IsEnum(PromotionType)
  promotion_type: PromotionType;

  @ApiProperty({
    example: 10,
    description:
      'Valeur de la promotion (10 pour 10% ou 10 pour 10€ en fonction du type)',
  })
  @IsNumber()
  promotion_valeur: number;

  @ApiProperty({
    example: 'PRODUIT',
    description: 'Scope de la promotion : COMMANDE, PRODUIT ou CATEGORIE',
  })
  @IsEnum(PromotionScope)
  scope: PromotionScope;

  @ApiProperty({
    example: 99999999,
    description: "Limite d'utilisation de la promotion",
  })
  @IsNumber()
  usage_limit: number;

  @ApiProperty({
    example: 0,
    description: "Nombre d'utilisations déjà effectuées",
  })
  @IsNumber()
  usage_count: number;

  @ApiProperty({
    example: true,
    description: 'Etat de la promotion (active ou non)',
  })
  @IsBoolean()
  etat: boolean;
}
