import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/common/enum/transaction-type';
import { TradeHistory } from 'src/trade/entities/trade-history.entity';
import { In, Repository } from 'typeorm';
import { CreateFundDto } from './dto/create-fund.dto';
import { FundAllocationDto } from './dto/fund-allocation.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { Fund } from './entities/fund.entity';

@Injectable()
export class FundService {
  constructor(
    @InjectRepository(Fund)
    private fundRepository: Repository<Fund>,
  ) {}

  async create(createFundDto: CreateFundDto): Promise<Fund> {
    return await this.fundRepository.save({
      ...createFundDto,
      minimumInvestAmount: createFundDto.minimumInvestAmount || 0,
      fundInvestmentbalance: 0,
    });
  }

  async findAll(): Promise<Fund[]> {
    return await this.fundRepository.find();
  }

  async findOne(id: number): Promise<Fund> {
    const fund = await this.fundRepository.findOne({
      where: { id },
    });

    if (!fund) {
      throw new NotFoundException();
    }

    return fund;
  }

  async update(id: number, updateFundDto: UpdateFundDto): Promise<Fund> {
    const fund = await this.fundRepository.findOneBy({ id: id });

    if (!fund) {
      throw new NotFoundException();
    }

    return await this.fundRepository.save({
      id: fund.id,
      fundName: updateFundDto.fundName ?? fund.fundName,
      fundDescription: updateFundDto.fundDescription ?? fund.fundDescription,
      minimumInvestAmount:
        updateFundDto.minimumInvestAmount ?? fund.minimumInvestAmount,
    });
  }

  async remove(id: number): Promise<Fund> {
    const fund = await this.fundRepository.findOneBy({ id: id });

    if (!fund) {
      throw new NotFoundException();
    }

    return await this.fundRepository.remove(fund);
  }

  async getFundAllocations(
    tradeHistories: TradeHistory[],
  ): Promise<FundAllocationDto[]> {
    // group by fundId
    const results = tradeHistories.reduce((a, b) => {
      (a[b.fundId] = a[b.fundId] || []).push(b);
      return a;
    }, {});

    const funds = await this.fundRepository.findBy({
      id: In(Object.keys(results)),
    });

    const fundAllocations = [] as FundAllocationDto[];
    for (const fund of funds) {
      const fundAllocation = new FundAllocationDto();
      fundAllocation.id = fund.id;
      fundAllocation.fundDescription = fund.fundDescription;
      fundAllocation.fundName = fund.fundName;
      fundAllocation.fundInvestmentBalance = fund.fundInvestmentBalance;
      fundAllocation.minimumInvestAmount = fund.minimumInvestAmount;
      const tradeHistories = results[fundAllocation.id] as TradeHistory[];
      fundAllocation.userInvestedBalance = tradeHistories.reduce((a, b) => {
        if (b.transactionType === TransactionType.DEPOSIT_FUND) {
          return +a + +b.transactionAmount;
        } else if (b.transactionType === TransactionType.WITHDRAW_FUND) {
          return +a - +b.transactionAmount;
        }
      }, 0);
      fundAllocations.push(FundAllocationDto.mutate(fundAllocation));
    }

    return fundAllocations;
  }
}
