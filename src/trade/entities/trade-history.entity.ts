import { TransactionType } from 'src/common/enum/transaction-type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Trade_History')
export class TradeHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  startingBalance: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  endingBalance: number;

  @Column()
  customerId: number;

  @Column()
  fundId: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  transactionAmount: number;

  @Column()
  transactionDate: Date;

  @Column()
  transactionType: TransactionType;
}
