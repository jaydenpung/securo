import { TradeHistory } from 'src/trade/entities/trade-history.entity';
import { Customer } from '../entities/customer.entity';

export class CustomerDTO {
  id: number;
  name: string;
  emailAddress: string;
  accountWalletAmount: number;
  tradeHistories: TradeHistory[];

  static mutate(customer: Customer): CustomerDTO {
    const dto = new CustomerDTO();
    dto.id = customer.id;
    dto.name = customer.name || null;
    dto.emailAddress = customer.emailAddress || null;
    dto.accountWalletAmount = +customer.accountWalletAmount || 0;
    dto.tradeHistories = customer.tradeHistories || [];

    return dto;
  }
}
