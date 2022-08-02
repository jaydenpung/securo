import { TransactionType } from 'src/common/enum/transaction-type';
import { Customer } from 'src/customer/entities/customer.entity';
import { Fund } from 'src/fund/entities/fund.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Trade_History')
export class TradeHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  startingBalance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  endingBalance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
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
