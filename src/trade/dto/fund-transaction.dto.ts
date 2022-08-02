import { IsNotEmpty, IsNumber } from 'class-validator';
import { WalletTransactionDto } from './wallet-transaction.dto';

export class FundTransactionDto extends WalletTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  fundId: number;
}
