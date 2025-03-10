import { CreateProduitDto } from './create-produit.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStickerDto extends CreateProduitDto {
  @ApiProperty({ example: 'rond' })
  @IsString()
  @IsNotEmpty()
  format: string;

  @ApiProperty({ example: '10x10cm' })
  @IsString()
  @IsNotEmpty()
  dimensions: string;

  @ApiProperty({ example: 'vinyle' })
  @IsString()
  @IsNotEmpty()
  materiau: string;
}
