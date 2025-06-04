import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Type(() => Number)
  prix: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Type(() => Number)
  stock: number;
}
