import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/common/enum/transaction-type';
import { CustomGeneralException } from 'src/common/exception/custom-general.exception';
import { ValidationException } from 'src/common/exception/validation.exception';
import { CustomerDTO } from 'src/customer/dto/customer.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Fund } from 'src/fund/entities/fund.entity';
import { Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';
import { FundTransactionDto } from './dto/fund-transaction.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { TradeHistory } from './entities/trade-history.entity';
import { FundService } from 'src/fund/fund.service';
import { ViewCustomerDTO } from 'src/customer/dto/view-customer.dto';

@Injectable()
export class TradeService {
  constructor(
    @Inject(FundService)
    private fundService: FundService,
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

    customer.accountWalletAmount =
      +customer.accountWalletAmount + +walletTransaction.amount;
    customer.tradeHistories.push(tradeHistory);
    return await this.customerRepository.save(customer);
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

    customer.accountWalletAmount =
      +customer.accountWalletAmount - +walletTransaction.amount;
    customer.tradeHistories.push(tradeHistory);
    return await this.customerRepository.save(customer);
  }

  async depositFund(fundTransaction: FundTransactionDto): Promise<CustomerDTO> {
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

    const allFundAllocations = await this.fundService.getFundAllocations(
      customer.tradeHistories,
    );
    const fundAllocation = allFundAllocations.find((el) => {
      return el.id == fund.id;
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

    customer.accountWalletAmount = balance.userWallet;
    customer.tradeHistories.push(tradeHistory);
    await this.customerRepository.save(customer);

    const viewCustomerDTO = customer as ViewCustomerDTO;
    viewCustomerDTO.fundAllocations = allFundAllocations.map((allocation) => {
      if (allocation.id == fund.id) {
        allocation.userInvestedBalance = balance.userFund;
        allocation.fundInvestmentBalance = balance.fundOverall;
      }
      return allocation;
    });
    return viewCustomerDTO;
  }

  async withdrawFund(
    fundTransaction: FundTransactionDto,
  ): Promise<ViewCustomerDTO> {
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

    const allFundAllocations = await this.fundService.getFundAllocations(
      customer.tradeHistories,
    );
    const fundAllocation = allFundAllocations.find((el) => {
      return el.id == fund.id;
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

    customer.accountWalletAmount = balance.userWallet;
    customer.tradeHistories.push(tradeHistory);
    await this.customerRepository.save(customer);

    const viewCustomerDTO = customer as ViewCustomerDTO;
    viewCustomerDTO.fundAllocations = allFundAllocations.map((allocation) => {
      if (allocation.id == fund.id) {
        allocation.userInvestedBalance = balance.userFund;
        allocation.fundInvestmentBalance = balance.fundOverall;
      }
      return allocation;
    });
    return viewCustomerDTO;
  }
}
