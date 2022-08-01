import { IsNumber } from 'class-validator';

export class WalletTransactionDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  amount: number;
}
