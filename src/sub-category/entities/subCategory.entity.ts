import { Category } from 'src/category/entities/category.entity';
import { ProductSpu } from 'src/product/entities/product-spu.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sub_category_name', nullable: false })
  subCategoryName: string;

  @Column({ name: 'sub_category_slug', nullable: false })
  subCategorySlug: string;

  @Column({ name: 'image', nullable: false })
  image: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    cascade: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductSpu, (productSpu) => productSpu.subCategory)
  productSpus: ProductSpu[];
}
