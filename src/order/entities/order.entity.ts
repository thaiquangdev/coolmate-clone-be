import { Address } from 'src/address/entities/address.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_code', unique: true })
  orderCode: string; // Mã đơn hàng để tra cứu (nếu cần)

  @Column({ name: 'payment_method' })
  paymentMethod: string; // Phương thức thanh toán (VD: COD, Online)

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'payment_url', type: 'text', nullable: true })
  paymentUrl: string; // URL thanh toán (trong trường hợp redirect).

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date; // Ngày thanh toán (có thể null nếu chưa thanh toán)

  @Column({ name: 'order_confirm', default: false })
  orderConfirm: boolean; // Trạng thái xác nhận đơn hàng

  @Column({ name: 'payment_status', default: 'đang chờ' })
  paymentStatus: string; // Trạng thái thanh toán (Pending, Paid, Failed, expired)

  @Column({ default: 'đang chờ' })
  status: string; // Trạng thái đơn hàng (Pending, Delivered, Cancelled)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'cart_id' })
  cartId: number;

  @Column({ name: 'address_id' })
  addressId: number;

  // Quan hệ 1-1 với Cart
  @OneToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Quan hệ 1-1 với User
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Quan hệ 1-1 với Address
  @OneToOne(() => Address)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ nullable: true })
  note: string; // Ghi chú của khách hàng
}
