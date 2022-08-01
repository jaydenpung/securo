import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Fund')
export class Fund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fundName: string;

  @Column()
  minimumInvestAmount: number;

  @Column()
  fundDescription: string;

  @Column()
  fundInvestmentBalance: number;
}
