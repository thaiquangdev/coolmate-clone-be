import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductSpu } from './product-spu.entity';

@Entity('product_image')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  url: string; // URL ảnh (có thể lưu trên Cloudinary, S3...)

  @Column({ name: 'product_spu_id' })
  productSpuId: number;

  @ManyToOne(() => ProductSpu, (spu) => spu.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_spu_id' })
  productSpu: ProductSpu;
}
