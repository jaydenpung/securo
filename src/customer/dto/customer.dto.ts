import { Customer } from '../entities/customer.entity';

export class CustomerDTO {
  id: number;
  name: string;
  emailAddress: string;
  accountWalletAmount: number;

  static mutate(customer: Customer): CustomerDTO {
    const dto = new CustomerDTO();
    dto.id = customer.id;
    dto.name = customer.name || null;
    dto.emailAddress = customer.emailAddress || null;
    dto.accountWalletAmount = customer.accountWalletAmount || 0;

    return dto;
  }
}
