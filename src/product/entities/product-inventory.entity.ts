import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductSku } from './product-sku.entity';

@Entity('product_inventory')
export class ProductInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_sku_id' })
  productSkuId: number;

  @Column({ name: 'change_type' })
  changeType: string; //import, export, adjust

  @Column({ name: 'quantity_change' })
  quantityChange: number;

  @Column({ name: 'remaining_stock' })
  remainingStock: number;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProductSku, (productSku) => productSku.productInventories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_sku_id' })
  productSku: ProductSku;
}
