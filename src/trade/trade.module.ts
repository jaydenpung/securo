import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from 'src/fund/entities/fund.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { TradeHistory } from './entities/trade-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fund, Customer, TradeHistory])],
  controllers: [TradeController],
  providers: [TradeService],
})
export class TradeModule {}
