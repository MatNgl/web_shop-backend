// src/produits/dto/update-dessin-numerique.dto.ts
import { UpdateProduitDto } from './update-produit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDessinNumeriqueDto extends UpdateProduitDto {
  @ApiPropertyOptional({ example: '1920x1080' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ example: 'A4' })
  @IsOptional()
  @IsString()
  dimensions?: string;
}
