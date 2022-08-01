import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Fund')
export class Fund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fundName: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  minimumInvestAmount: number;

  @Column()
  fundDescription: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  fundInvestmentBalance: number;
}
