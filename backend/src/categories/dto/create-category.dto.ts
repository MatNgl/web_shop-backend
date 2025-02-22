import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Livres', description: 'Nom de la catégorie' })
  @IsString()
  nom: string;

  @ApiProperty({
    example: 'Une collection de livres et romans',
    description: 'Description de la catégorie',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
