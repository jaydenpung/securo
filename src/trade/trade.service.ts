import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/common/enum/transaction-type';
import { CustomGeneralException } from 'src/common/exception/custom-general.exception';
import { ValidationException } from 'src/common/exception/validation.exception';
import { CustomerDTO } from 'src/customer/dto/customer.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Fund } from 'src/fund/entities/fund.entity';
import { In, Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';
import { FundAllocationDto } from './dto/fund-allocation.dto';
import { FundTransactionDto } from './dto/fund-transaction.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
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
  ) {}

  async depositWallet(
    walletTransaction: WalletTransactionDto,
  ): Promise<CustomerDTO> {
    const customer = await this.customerRepository.findOne({
      where: {
        id: walletTransaction.customerId,
      },
      relations: ['tradeHistories'],
    });

    if (!customer) {
      throw new NotFoundException();
    }

    const tradeHistory = await this.tradeHistoryRepository.save({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount + +walletTransaction.amount,
      transactionAmount: walletTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.DEPOSIT_WALLET,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }

    return await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount:
        +customer.accountWalletAmount + +walletTransaction.amount,
      tradeHistories: [...customer.tradeHistories, tradeHistory],
    });
  }

  async withdrawWallet(
    walletTransaction: WalletTransactionDto,
  ): Promise<CustomerDTO> {
    const customer = await this.customerRepository.findOne({
      where: {
        id: walletTransaction.customerId,
      },
      relations: ['tradeHistories'],
    });

    if (!customer) {
      throw new NotFoundException();
    }

    if (customer.accountWalletAmount < walletTransaction.amount) {
      throw new ValidationException('Insufficient Balance');
    }

    const tradeHistory = await this.tradeHistoryRepository.save({
      startingBalance: customer.accountWalletAmount,
      endingBalance: +customer.accountWalletAmount - +walletTransaction.amount,
      transactionAmount: walletTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.WITHDRAW_WALLET,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }

    return await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount:
        +customer.accountWalletAmount - +walletTransaction.amount,
      tradeHistories: [...customer.tradeHistories, tradeHistory],
    });
  }

  async depositFund(fundTransaction: FundTransactionDto): Promise<BalanceDto> {
    // customer
    const customer = await this.customerRepository.findOne({
      where: {
        id: fundTransaction.customerId,
      },
      relations: ['tradeHistories'],
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
    if (fundTransaction.amount < fund.minimumInvestAmount) {
      throw new ValidationException(
        'Amount does not meet minimum invest requirement',
      );
    }

    const allFundAllocations = await this.getCustomerFundAllocations(
      customer.tradeHistories,
    );
    const fundAllocation = allFundAllocations.find((el) => {
      return el.fundId == fund.id;
    });

    const balance = {
      userWallet: +customer.accountWalletAmount - +fundTransaction.amount,
      userFund: +fundAllocation.userInvestedBalance + +fundTransaction.amount,
      fundOverall: +fund.fundInvestmentBalance + +fundTransaction.amount,
    } as BalanceDto;

    //trade history
    const tradeHistory = await this.tradeHistoryRepository.save({
      startingBalance: customer.accountWalletAmount,
      endingBalance: balance.userWallet,
      transactionAmount: fundTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.DEPOSIT_FUND,
      fundId: fund.id,
    });

    await this.fundRepository.save({
      id: fund.id,
      fundInvestmentBalance: balance.fundOverall,
    });

    await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount: balance.userWallet,
      tradeHistories: [...customer.tradeHistories, tradeHistory],
    });

    return balance;
  }

  async withdrawFund(fundTransaction: FundTransactionDto): Promise<BalanceDto> {
    // customer
    const customer = await this.customerRepository.findOne({
      where: { id: fundTransaction.customerId },
      relations: ['tradeHistories'],
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // fund
    const fund = await this.fundRepository.findOneBy({
      id: fundTransaction.fundId,
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }

    const allFundAllocations = await this.getCustomerFundAllocations(
      customer.tradeHistories,
    );
    const fundAllocation = allFundAllocations.find((el) => {
      return el.fundId == fund.id;
    });

    if (!fundAllocation) {
      throw new ValidationException('Insufficient balance in fund');
    }

    if (fundAllocation.userInvestedBalance < fundTransaction.amount) {
      throw new ValidationException('Insufficient balance in fund');
    }

    const balance = {
      userWallet: +customer.accountWalletAmount + +fundTransaction.amount,
      userFund: +fundAllocation.userInvestedBalance - +fundTransaction.amount,
      fundOverall: +fund.fundInvestmentBalance - +fundTransaction.amount,
    } as BalanceDto;

    // trade history
    const tradeHistory = await this.tradeHistoryRepository.save({
      startingBalance: customer.accountWalletAmount,
      endingBalance: balance.userWallet,
      transactionAmount: fundTransaction.amount,
      transactionDate: new Date(),
      transactionType: TransactionType.WITHDRAW_FUND,
    });

    if (!tradeHistory) {
      throw new CustomGeneralException('Unable to create transaction');
    }

    // save all
    await this.fundRepository.save({
      id: fund.id,
      fundInvestmentBalance: balance.fundOverall,
    });

    await this.customerRepository.save({
      id: customer.id,
      accountWalletAmount: balance.userWallet,
      tradeHistories: [...customer.tradeHistories, tradeHistory],
    });

    return balance;
  }

  async getCustomerFundAllocations(
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

    const fundAllocations = [];
    for (const fund of funds) {
      const fundAllocation = new FundAllocationDto();
      fundAllocation.fundId = fund.id;
      fundAllocation.fundDescription = fund.fundDescription;
      fundAllocation.fundName = fund.fundName;
      fundAllocation.fundInvestmentBalance = fund.fundInvestmentBalance;
      fundAllocation.minimumInvestAmount = fund.minimumInvestAmount;
      const tradeHistories = results[fundAllocation.fundId] as TradeHistory[];
      fundAllocation.userInvestedBalance = tradeHistories.reduce((a, b) => {
        if (b.transactionType === TransactionType.DEPOSIT_FUND) {
          return +a + +b.transactionAmount;
        } else if (b.transactionType === TransactionType.WITHDRAW_FUND) {
          return +a - +b.transactionAmount;
        }
      }, 0);
      fundAllocations.push(fundAllocation);
    }

    console.log(fundAllocations);
    return fundAllocations;
  }
}
