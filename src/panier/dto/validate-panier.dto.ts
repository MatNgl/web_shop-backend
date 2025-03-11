import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePanierDto {
  @ApiProperty({
    example: '123 Rue de Paris, 75000 Paris',
    description: 'Adresse de livraison',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    example: 'cb',
    description: 'Moyen de paiement (ex: cb, paypal)',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
