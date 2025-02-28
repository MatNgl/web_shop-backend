import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistItemDto {
  @ApiProperty({
    example: 5,
    description: "L'ID du produit à ajouter à la wishlist",
  })
  @IsInt()
  @Min(1, { message: 'Le produitId doit être un entier positif' })
  produitId: number;
}
