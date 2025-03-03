// src/commandes/dto/create-commande.dto.ts
export class CreateCommandeDto {
  // Optionnels : ils pourront être renseignés dès la validation du panier
  readonly shippingAddress?: string;
  readonly paymentMethod?: string;
  readonly userId: number;
}
