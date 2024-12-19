import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProductSpu } from './product-spu.entity';
import { ProductInventory } from './product-inventory.entity';

@Entity('product_sku')
export class ProductSku {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'color_name', nullable: false })
  colorName: string;

  @Column({ nullable: false })
  size: string;

  @Column({ nullable: false })
  sku: string;

  @Column({ nullable: true, default: 0 })
  quantity: number;

  @Column({ name: 'product_spu_id' })
  productSpuId: number;

  @ManyToOne(() => ProductSpu, (spu) => spu.skus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_spu_id' })
  productSpu: ProductSpu;

  @OneToMany(() => ProductInventory, (inventory) => inventory.productSku, {
    cascade: true,
  })
  productInventories: ProductInventory[];
}
