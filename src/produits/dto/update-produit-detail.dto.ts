import { PartialType } from '@nestjs/swagger';
import { CreateProduitDetailDto } from './create-produit-detail.dto';

export class UpdateProduitDetailDto extends PartialType(
  CreateProduitDetailDto,
) {}
