import { IsNumber } from 'class-validator';
import { WalletTransactionDto } from './wallet-transaction.dto';

export class FundTransactionDto extends WalletTransactionDto {
  @IsNumber()
  fundId: number;
}
