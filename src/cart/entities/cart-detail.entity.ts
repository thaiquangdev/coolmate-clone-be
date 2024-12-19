import { ProductSpu } from 'src/product/entities/product-spu.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart-details')
export class CartDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'cart_id' })
  cartId: number;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column()
  quantity: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'sku' })
  sku: string;

  @Column({ name: 'sub_total', type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => ProductSpu, (productSpu) => productSpu.details)
  @JoinColumn({ name: 'product_id' }) // Thêm name
  product: ProductSpu;

  @ManyToOne(() => Cart, (cart) => cart.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' }) // Thêm name
  cart: Cart;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
