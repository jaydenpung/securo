import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IdParameterDTO } from 'src/common/dto/id-parameter.dto';
import { FundService } from './fund.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { FundDTO } from './dto/fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { Fund } from './entities/fund.entity';

@Controller('fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Post()
  async create(@Body() createFundDto: CreateFundDto) {
    const fund = await this.fundService.create(createFundDto);
    return FundDTO.mutate(fund);
  }

  @Get()
  async findAll() {
    const result = await this.fundService.findAll();
    return (result as Fund[]).map<FundDTO>(FundDTO.mutate);
  }

  @Get(':id')
  async findOne(@Param() { id }: IdParameterDTO) {
    const fund = await this.fundService.findOne(id);
    return FundDTO.mutate(fund);
  }

  @Patch(':id')
  async update(
    @Param() { id }: IdParameterDTO,
    @Body() updateFundDto: UpdateFundDto,
  ) {
    const fund = await this.fundService.update(id, updateFundDto);
    return FundDTO.mutate(fund);
  }

  @Delete(':id')
  async remove(@Param() { id }: IdParameterDTO) {
    return this.fundService.remove(id);
  }
}
