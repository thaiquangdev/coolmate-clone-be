import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartDetail } from './cart-detail.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    cascade: true,
  })
  details: CartDetail[];

  @OneToOne(() => Order, (order) => order.cart)
  order: Order;

  @Column({ name: 'coupon_code', nullable: true })
  couponCode: string | null;

  @Column({ name: 'discount_amount', nullable: true })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal' })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
