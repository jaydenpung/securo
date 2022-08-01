import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from 'src/fund/entities/fund.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { TradeHistory } from './entities/trade-history.entity';
import { FundAllocation } from './entities/fund-allocation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fund, Customer, TradeHistory, FundAllocation]),
  ],
  controllers: [TradeController],
  providers: [TradeService],
})
export class TradeModule {}
