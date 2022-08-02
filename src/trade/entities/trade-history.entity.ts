import { TransactionType } from 'src/common/enum/transaction-type';
import { Customer } from 'src/customer/entities/customer.entity';
import { Fund } from 'src/fund/entities/fund.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Trade_History')
export class TradeHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  startingBalance: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  endingBalance: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  transactionAmount: number;

  @Column()
  transactionDate: Date;

  @Column()
  transactionType: TransactionType;

  @Column()
  fundId: number;

  @ManyToOne(() => Customer, (customer) => customer.tradeHistories)
  customer: Customer;
}
