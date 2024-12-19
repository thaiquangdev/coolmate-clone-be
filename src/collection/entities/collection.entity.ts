import { ProductSpu } from 'src/product/entities/product-spu.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collection_name', nullable: false })
  collectionName: string;

  @Column({ name: 'collection_slug', nullable: false })
  collectionSlug: string;

  @Column({ name: 'image', nullable: false })
  image: string;

  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductSpu, (productSpu) => productSpu.collection)
  productSpus: ProductSpu[];
}
