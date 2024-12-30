import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { Role } from 'src/role/entities/role.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Address } from 'src/address/entities/address.entity';
import { Order } from 'src/order/entities/order.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity('users') // Tùy chỉnh tên bảng nếu cần
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', nullable: false })
  fullName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expiry', type: 'timestamp', nullable: true })
  passwordResetExpiry: Date;

  @Column({ name: 'email_verify', default: false })
  emailVerify: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ name: 'google_id', nullable: true })
  googleId: string;

  @Column({ name: 'facebook_id', nullable: true })
  facebookId: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: ['google', 'facebook', 'local'],
    default: 'local',
  })
  accountType: 'google' | 'facebook' | 'local';

  @Column({ name: 'role_id' })
  roleId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
  })
  addresses: Address;

  @OneToOne(() => Order, (order) => order.cart)
  order: Order;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
