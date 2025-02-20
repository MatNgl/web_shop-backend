import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProduitDto {
  @ApiProperty({ example: 'Mon Produit' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 'Ceci est la description du produit',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  prix: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categorie_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  statut_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  promotion_id?: number;
}
