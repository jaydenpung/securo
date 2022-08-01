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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDTO } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    return CustomerDTO.mutate(customer);
  }

  @Get()
  async findAll() {
    const result = await this.customerService.findAll();
    return (result as Customer[]).map<CustomerDTO>(CustomerDTO.mutate);
  }

  @Get(':id')
  async findOne(@Param() { id }: IdParameterDTO) {
    const customer = await this.customerService.findOne(id);
    return CustomerDTO.mutate(customer);
  }

  @Patch(':id')
  async update(
    @Param() { id }: IdParameterDTO,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customerService.update(id, updateCustomerDto);
    return CustomerDTO.mutate(customer);
  }

  @Delete(':id')
  async remove(@Param() { id }: IdParameterDTO) {
    return this.customerService.remove(id);
  }
}
