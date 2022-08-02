import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { FundService } from 'src/fund/fund.service';
import { Fund } from 'src/fund/entities/fund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Fund])],
  controllers: [CustomerController],
  providers: [CustomerService, FundService],
})
export class CustomerModule {}
