import { ProductSpu } from 'src/product/entities/product-spu.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column()
  sku: string;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column()
  comment: string;

  @Column()
  star: number;

  @Column({ nullable: true })
  isReply: boolean;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ProductSpu, (spu) => spu.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductSpu;

  // Quan hệ với bình luận cha
  @ManyToOne(() => Review, (review) => review.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Review;

  // Quan hệ với các phản hồi
  @OneToMany(() => Review, (review) => review.parent)
  replies: Review[];
}
