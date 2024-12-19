import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coupon_code' })
  couponCode: string;

  @Column({ name: 'coupon_quantity' })
  couponQuantity: number;

  @Column({ name: 'price_discount', type: 'decimal' })
  priceDiscount: number;

  @Column()
  description: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['Active', 'Expired', 'Used'],
    default: 'Active',
  })
  status: string;

  @Column({
    name: 'min_order_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderValue: number;

  @Column()
  expire: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
