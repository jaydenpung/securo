import { Fund } from '../entities/fund.entity';

export class FundDTO {
  id: number;
  fundName: string;
  minimumInvestAmount: number;
  fundDescription: string;
  fundInvestmentBalance: number;

  static mutate(fund: Fund): FundDTO {
    const dto = new FundDTO();
    dto.id = fund.id;
    dto.fundName = fund.fundName || null;
    dto.minimumInvestAmount = +fund.minimumInvestAmount || 0;
    dto.fundDescription = fund.fundDescription || null;
    dto.fundInvestmentBalance = +fund.fundInvestmentBalance || 0;

    return dto;
  }
}
