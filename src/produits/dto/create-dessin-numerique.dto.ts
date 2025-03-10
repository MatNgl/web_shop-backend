import { CreateProduitDto } from './create-produit.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDessinNumeriqueDto extends CreateProduitDto {
  @ApiProperty({ example: '1920x1080' })
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @ApiProperty({ example: 'A4' })
  @IsString()
  @IsNotEmpty()
  dimensions: string;
}
