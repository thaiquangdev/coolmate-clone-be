import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductSku } from './product-sku.entity';
import { Category } from 'src/category/entities/category.entity';
import { SubCategory } from 'src/sub-category/entities/subCategory.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { ProductImage } from './product-image.entity';
import { CartDetail } from 'src/cart/entities/cart-detail.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity('product_spu')
export class ProductSpu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  slug: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, default: 0 })
  discount: number;

  @Column({ nullable: true, type: 'text' })
  highlights: string;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false, default: 'active' })
  status: string; // trạng thái sản phẩm (active, inactive)

  @Column({ nullable: true, default: 0 })
  avgRating: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'sub_category_id' })
  subCategoryId: number;

  @Column({ name: 'collection_id', nullable: true })
  collectionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductSku, (sku) => sku.productSpu, {
    cascade: true,
  })
  skus: ProductSku[];

  @ManyToOne(() => Category, (category) => category.productSpus)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.productSpus)
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @ManyToOne(() => Collection, (collection) => collection.productSpus)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @OneToMany(() => ProductImage, (productImage) => productImage.productSpu, {
    cascade: true,
  })
  images: ProductImage[];

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.product)
  details: CartDetail[];

  @OneToMany(() => Review, (review) => review.product, {
    cascade: true,
  })
  reviews: Review[];
}
