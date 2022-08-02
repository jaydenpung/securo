import { FundDTO } from './fund.dto';

export class FundAllocationDto extends FundDTO {
  userInvestedBalance: number;

  static mutate(fund: FundAllocationDto): FundAllocationDto {
    if (!fund) {
      return null;
    }
    fund.minimumInvestAmount = +fund?.minimumInvestAmount || 0;
    fund.fundInvestmentBalance = +fund?.fundInvestmentBalance || 0;
    fund.userInvestedBalance = +fund?.userInvestedBalance || 0;

    return fund;
  }
}
