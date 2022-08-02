import { FundAllocationDto } from 'src/fund/dto/fund-allocation.dto';
import { CustomerDTO } from './customer.dto';

export class ViewCustomerDTO extends CustomerDTO {
  fundAllocations: FundAllocationDto[];
}
