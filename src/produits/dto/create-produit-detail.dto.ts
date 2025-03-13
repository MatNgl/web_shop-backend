import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProduitDetailDto {
  @ApiProperty({ example: '1920x1080' })
  @IsString()
  @IsNotEmpty()
  format: string;

  @ApiProperty({ example: 'A4' })
  @IsString()
  @IsNotEmpty()
  dimensions: string;

  @ApiPropertyOptional({ example: 'vinyle' })
  @IsOptional()
  @IsString()
  support?: string;
}
