import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from 'src/common/exception/validation.exception';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
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

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['tradeHistories'],
    });

    if (!customer) {
      throw new NotFoundException();
    }

    return customer;
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
