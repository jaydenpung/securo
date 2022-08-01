import { Controller, Post, Body } from '@nestjs/common';
import { TradeService } from './trade.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { CustomerDTO } from 'src/customer/dto/customer.dto';
import { FundTransactionDto } from './dto/fund-transaction.dto';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('deposit-wallet')
  async depositWallet(@Body() walletTransactionDto: WalletTransactionDto) {
    const customer = await this.tradeService.depositWallet(
      walletTransactionDto,
    );
    return CustomerDTO.mutate(customer);
  }

  @Post('withdraw-wallet')
  async withdrawWallet(@Body() walletTransactionDto: WalletTransactionDto) {
    const customer = await this.tradeService.withdrawWallet(
      walletTransactionDto,
    );
    return CustomerDTO.mutate(customer);
  }

  @Post('deposit-fund')
  async depositFund(@Body() fundTransactionDto: FundTransactionDto) {
    return await this.tradeService.depositFund(fundTransactionDto);
  }

  @Post('withdraw-fund')
  async withdrawFund(@Body() fundTransactionDto: FundTransactionDto) {
    return await this.tradeService.withdrawFund(fundTransactionDto);
  }
}
