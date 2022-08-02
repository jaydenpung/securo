import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from 'src/common/exception/validation.exception';
import { FundService } from 'src/fund/fund.service';
import { Not, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ViewCustomerDTO } from './dto/view-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(FundService)
    private fundService: FundService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const duplicate = await this.customerRepository.findOneBy({
      emailAddress: createCustomerDto.emailAddress,
    });

    if (duplicate) {
      throw new ValidationException('Email address already registered');
    }

    return await this.customerRepository.save({
      ...createCustomerDto,
      accountWalletAmount: 0,
    });
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find();
  }

  async findOne(id: number): Promise<ViewCustomerDTO> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['tradeHistories'],
    });

    if (!customer) {
      throw new NotFoundException();
    }

    const fundAllocations = await this.fundService.getFundAllocations(
      customer.tradeHistories,
    );

    return {
      ...customer,
      fundAllocations: fundAllocations,
    } as ViewCustomerDTO;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id: id });

    if (!customer) {
      throw new NotFoundException();
    }

    if (updateCustomerDto.emailAddress) {
      const duplicate = await this.customerRepository.findOneBy({
        emailAddress: updateCustomerDto.emailAddress,
        id: Not(id),
      });

      if (duplicate) {
        throw new ValidationException('Email address already registered');
      }
    }

    return await this.customerRepository.save({
      id: customer.id,
      name: updateCustomerDto.name ?? customer.name,
      emailAddress: updateCustomerDto.emailAddress ?? customer.emailAddress,
    });
  }

  async remove(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id: id });

    if (!customer) {
      throw new NotFoundException();
    }

    return await this.customerRepository.remove(customer);
  }
}
