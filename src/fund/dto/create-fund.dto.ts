import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFundDto {
  @IsString()
  fundName: string;

  @IsOptional()
  @IsNumber()
  minimumInvestAmount: number;

  @IsString()
  fundDescription: string;
}
