// src/commandes/dto/create-commande.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommandeDto {
  @ApiProperty({
    example: '123 Rue de Paris, 75000 Paris',
    description: 'Adresse de livraison',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    example: 'Carte bancaire',
    description: 'Moyen de paiement (ex: Carte bancaire, Paypal)',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  // Ce champ sera complété automatiquement côté serveur et ne doit pas être fourni par le client
  @ApiPropertyOptional({
    readOnly: true,
    description: 'ID de l’utilisateur (assigné automatiquement)',
  })
  @IsOptional()
  userId?: number;
}
