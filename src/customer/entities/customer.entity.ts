import { TradeHistory } from 'src/trade/entities/trade-history.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  emailAddress: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  accountWalletAmount: number;

  @OneToMany(() => TradeHistory, (tradeHistory) => tradeHistory.customer)
  tradeHistories: TradeHistory[];
}
