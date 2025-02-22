import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductDto {
  @ApiProperty({
    example: 5,
    description: "L'ID du produit à ajouter",
  })
  @IsInt()
  @Min(1, { message: 'Le produitId doit être un entier positif' })
  produitId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantité du produit',
  })
  @IsInt()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantite: number;
}
