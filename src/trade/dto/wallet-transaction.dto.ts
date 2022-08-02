import { IsNotEmpty, IsNumber } from 'class-validator';

export class WalletTransactionDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
