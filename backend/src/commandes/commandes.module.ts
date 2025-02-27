import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './entities/commande.entity';
import { CommandesService } from './commandes.service';
import { CommandesController } from './commandes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Commande])],
  controllers: [CommandesController],
  providers: [CommandesService],
  exports: [CommandesService],
})
export class CommandesModule {}
