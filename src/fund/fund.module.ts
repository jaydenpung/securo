import { Module } from '@nestjs/common';
import { FundService } from './fund.service';
import { FundController } from './fund.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './entities/fund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fund])],
  controllers: [FundController],
  providers: [FundService],
})
export class FundModule {}
