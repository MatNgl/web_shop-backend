import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuantityDto {
  @ApiProperty({
    example: 3,
    description: 'Nouvelle quantité souhaitée',
  })
  @IsInt()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantite: number;
}
