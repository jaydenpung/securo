import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Fund_Allocation')
export class FundAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  fundId: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  balance: number;
}
