// entities/historique_inventaire.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('historique_inventaire')
export class HistoriqueInventaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  produit_id: number;

  @Column({ type: 'int' })
  quantite_avant: number;

  @Column({ type: 'int' })
  quantite_apres: number;

  @Column({ type: 'int' })
  modifie_par: number;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
