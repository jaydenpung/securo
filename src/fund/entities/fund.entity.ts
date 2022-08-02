import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Fund')
export class Fund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fundName: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  minimumInvestAmount: number;

  @Column()
  fundDescription: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  fundInvestmentBalance: number;
}
