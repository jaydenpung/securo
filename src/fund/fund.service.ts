import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { Fund } from './entities/fund.entity';

@Injectable()
export class FundService {
  constructor(
    @InjectRepository(Fund)
    private fundRepository: Repository<Fund>,
  ) {}

  async create(createFundDto: CreateFundDto): Promise<Fund> {
    return await this.fundRepository.save({
      ...createFundDto,
      minimumInvestAmount: createFundDto.minimumInvestAmount || 0,
      fundInvestmentbalance: 0,
    });
  }

  async findAll(): Promise<Fund[]> {
    return await this.fundRepository.find();
  }

  async findOne(id: number): Promise<Fund> {
    const fund = await this.fundRepository.findOne({
      where: { id },
    });

    if (!fund) {
      throw new NotFoundException();
    }

    return fund;
  }

  async update(id: number, updateFundDto: UpdateFundDto): Promise<Fund> {
    const fund = await this.fundRepository.findOneBy({ id: id });

    if (!fund) {
      throw new NotFoundException();
    }

    return await this.fundRepository.save({
      id: fund.id,
      fundName: updateFundDto.fundName ?? fund.fundName,
      fundDescription: updateFundDto.fundDescription ?? fund.fundDescription,
      minimumInvestAmount:
        updateFundDto.minimumInvestAmount ?? fund.minimumInvestAmount,
    });
  }

  async remove(id: number): Promise<Fund> {
    const fund = await this.fundRepository.findOneBy({ id: id });

    if (!fund) {
      throw new NotFoundException();
    }

    return await this.fundRepository.remove(fund);
  }
}
