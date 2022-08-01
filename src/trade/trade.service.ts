import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/common/enum/transaction-type';
import { CustomGeneralException } from 'src/common/exception/custom-general.exception';
import { ValidationException } from 'src/common/exception/validation.exception';
import { Customer } from 'src/customer/entities/customer.entity';
import { Fund } from 'src/fund/entities/fund.entity';
import { In, Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';
import { FundTransactionDto } from './dto/fund-transaction.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { FundAllocation } from './entities/fund-allocation.entity';
import { TradeHistory } from './entities/trade-history.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Fund)
    private fundRepository: Repository<Fund>,
    @InjectRepository(TradeHistory)
    private tradeHistoryRepository: Repository<TradeHistory>,
    @InjectRepository(FundAllocation)
    private fundAllocationRepository: Repository<FundAllocation>,
  ) {}

  async depositWallet(walletTransaction: WalletTransactionDto) {
    const customer = await this.customerRepository.findOneBy({
      id: walletTransaction.customerId,
    });

    if (!customer) {
      throw new NotFoundException();
    }

    const tradeHistory = await this.tradeHistoryRepository.insert({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount + +walletTransaction.amount,
      customerId: customer.id,
      transactionAmount: walletTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.DEPOSIT_WALLET,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }
    customer.accountWalletAmount =
      +customer.accountWalletAmount + +walletTransaction.amount;
    return await this.customerRepository.save(customer);
  }

  async withdrawWallet(walletTransaction: WalletTransactionDto) {
    const customer = await this.customerRepository.findOneBy({
      id: walletTransaction.customerId,
    });

    if (!customer) {
      throw new NotFoundException();
    }

    if (customer.accountWalletAmount < walletTransaction.amount) {
      throw new ValidationException('Insufficient Balance');
    }

    const tradeHistory = await this.tradeHistoryRepository.insert({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount - +walletTransaction.amount,
      customerId: customer.id,
      transactionAmount: walletTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.WITHDRAW_WALLET,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }
    customer.accountWalletAmount =
      +customer.accountWalletAmount - +walletTransaction.amount;
    return await this.customerRepository.save(customer);
  }

  async depositFund(fundTransaction: FundTransactionDto): Promise<BalanceDto> {
    // customer
    const customer = await this.customerRepository.findOneBy({
      id: fundTransaction.customerId,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    if (customer.accountWalletAmount < fundTransaction.amount) {
      throw new ValidationException('Insufficient Balance');
    }

    // fund
    const fund = await this.fundRepository.findOneBy({
      id: fundTransaction.fundId,
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }

    // fund allocation
    let fundAllocation = await this.fundAllocationRepository.findOneBy({
      fundId: fund.id,
      customerId: customer.id,
    });
    if (fundTransaction.amount < fund.minimumInvestAmount) {
      throw new ValidationException(
        'Amount does not meet minimum invest requirement',
      );
    }

    //trade history
    const tradeHistory = await this.tradeHistoryRepository.insert({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount - +fundTransaction.amount,
      customerId: customer.id,
      fundId: fund.id,
      transactionAmount: fundTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.DEPOSIT_FUND,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }

    // save all
    if (!fundAllocation) {
      fundAllocation = new FundAllocation();
      fundAllocation.customerId = customer.id;
      fundAllocation.fundId = fund.id;
      fundAllocation.balance = 0;
    }
    fundAllocation.balance = +fundAllocation.balance + +fundTransaction.amount;

    await this.fundAllocationRepository.save(fundAllocation);

    await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount:
        +customer.accountWalletAmount - +fundTransaction.amount,
    });
    await this.fundRepository.save({
      id: fund.id,
      fundInvestmentBalance:
        +fund.fundInvestmentBalance + +fundTransaction.amount,
    });

    return {
      walletBalance: customer.accountWalletAmount,
      fundBalance: fundAllocation.balance,
    } as BalanceDto;
  }

  async withdrawFund(fundTransaction: FundTransactionDto): Promise<BalanceDto> {
    // customer
    const customer = await this.customerRepository.findOneBy({
      id: fundTransaction.customerId,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.accountWalletAmount < fundTransaction.amount) {
      throw new ValidationException('Insufficient Balance');
    }

    // fund
    const fund = await this.fundRepository.findOneBy({
      id: fundTransaction.fundId,
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }

    // fund allocation
    let fundAllocation = await this.fundAllocationRepository.findOneBy({
      fundId: fund.id,
      customerId: customer.id,
    });
    if (fundAllocation) {
      if (fundAllocation.balance < fundTransaction.amount) {
        throw new ValidationException('Insufficient Balance');
      }
      if (
        +fundAllocation.balance - +fundTransaction.amount <
        fund.minimumInvestAmount
      ) {
        throw new ValidationException(
          'Allocated fund balance cannot be less than minimum invest requirement',
        );
      }
    }

    // trade history
    const tradeHistory = await this.tradeHistoryRepository.insert({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount - +fundTransaction.amount,
      customerId: customer.id,
      fundId: fund.id,
      transactionAmount: fundTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.DEPOSIT_FUND,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }

    // save all
    if (!fundAllocation) {
      fundAllocation = new FundAllocation();
      fundAllocation.customerId = customer.id;
      fundAllocation.fundId = fund.id;
      fundAllocation.balance = 0;
    }
    fundAllocation.balance = +fundAllocation.balance - +fundTransaction.amount;

    await this.fundAllocationRepository.save(fundAllocation);

    await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount:
        +customer.accountWalletAmount + +fundTransaction.amount,
    });
    await this.fundRepository.save({
      id: fund.id,
      fundInvestmentBalance:
        +fund.fundInvestmentBalance - +fundTransaction.amount,
    });

    return {
      walletBalance: customer.accountWalletAmount,
      fundBalance: fundAllocation.balance,
    } as BalanceDto;
  }
}
