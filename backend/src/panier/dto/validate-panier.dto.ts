import { IsString } from 'class-validator';

export class ValidatePanierDto {
  @IsString()
  shippingAddress: string;

  @IsString()
  paymentMethod: string;
}
