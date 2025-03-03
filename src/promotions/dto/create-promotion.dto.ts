import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'PROMO10', description: 'Code de promotion unique' })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Réduction de 10% sur une sélection d’articles',
    description: 'Description de la promotion',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 10, description: 'Pourcentage de réduction' })
  @IsInt()
  pourcentage_reduction: number;

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
}
