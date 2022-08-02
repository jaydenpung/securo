import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFundDto {
  @IsString()
  @IsNotEmpty()
  fundName: string;

  @IsOptional()
  @IsNumber()
  minimumInvestAmount: number;

  @IsString()
  @IsNotEmpty()
  fundDescription: string;
}
