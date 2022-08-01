import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  emailAddress: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  accountWalletAmount: number;
}
