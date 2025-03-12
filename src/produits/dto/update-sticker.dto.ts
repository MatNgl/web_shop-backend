// src/produits/dto/update-sticker.dto.ts
import { UpdateProduitDto } from './update-produit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStickerDto extends UpdateProduitDto {
  @ApiPropertyOptional({ example: 'rond' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ example: '10x10cm' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({ example: 'vinyle' })
  @IsOptional()
  @IsString()
  materiau?: string;
}
