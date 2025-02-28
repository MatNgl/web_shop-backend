// src/commandes/dto/update-commande.dto.ts
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '../entities/commande.entity';

export class UpdateCommandeDto {
  shippingAddress?: string;
  paymentMethod?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  shippingCost?: number;
  expeditionDate?: Date;
  estimatedDeliveryDate?: Date;
}
