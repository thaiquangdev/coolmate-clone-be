import { SubCategory } from 'src/sub-category/entities/subCategory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductSpu } from 'src/product/entities/product-spu.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_name', nullable: false })
  categoryName: string;

  @Column({ name: 'category_slug', nullable: false })
  categorySlug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, {
    onDelete: 'CASCADE',
  })
  subCategories: SubCategory[];

  @OneToMany(() => ProductSpu, (productSpu) => productSpu.category)
  productSpus: ProductSpu[];
}
