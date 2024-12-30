import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductSpu } from 'src/product/entities/product-spu.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ProductSpu)
    private readonly productSpuRepository: Repository<ProductSpu>,
    private readonly dataSource: DataSource,
  ) {}

  // tạo mới một review
  async createOrUpdateReview(
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<{ message: string }> {
    const { productId, sku, size, color, comment, star } = createReviewDto;

    // Tạo transaction manager
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra sự tồn tại của review
      const existingReview = await queryRunner.manager.findOne(Review, {
        where: { productId, sku, size, color, userId },
      });

      if (existingReview) {
        // Cập nhật review đã tồn tại
        existingReview.comment = comment;
        existingReview.star = star;
        existingReview.updatedAt = new Date();

        await queryRunner.manager.save(Review, existingReview);
      } else {
        // Tạo mới review
        const newReview = queryRunner.manager.create(Review, {
          productId,
          userId,
          sku,
          size,
          color,
          comment,
          star,
        });

        await queryRunner.manager.save(Review, newReview);
      }

      // Lấy thông tin sản phẩm và tính toán avgRating
      const product = await queryRunner.manager.findOne(ProductSpu, {
        where: { id: productId },
        relations: ['reviews'],
      });

      if (!product) {
        throw new HttpException('Sản phẩm không tồn tại', HttpStatus.NOT_FOUND);
      }

      const totalStars = product.reviews.reduce(
        (sum, review) => sum + review.star,
        star,
      );
      const avgRating = totalStars / product.reviews.length;

      product.avgRating = avgRating;
      await queryRunner.manager.save(ProductSpu, product);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        message: existingReview
          ? 'Cập nhật review thành công'
          : 'Tạo review thành công',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // cập nhật review
  async editReview(
    userId: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<{ message: string }> {
    const { productId, sku, size, color, comment, star } = updateReviewDto;

    // Tạo transaction manager
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // kiểm tra sự tồn tại của review
      const existingReview = await queryRunner.manager.findOne(Review, {
        where: { productId, sku, size, color, userId },
      });

      if (!existingReview) {
        throw new HttpException(
          'Không tìm thấy bình luận',
          HttpStatus.BAD_REQUEST,
        );
      }

      // cập nhật review
      existingReview.comment = comment;
      existingReview.star = star;
      existingReview.updatedAt = new Date();

      await queryRunner.manager.save(Review, existingReview);

      // lấy thông tin sản phẩm và tính toán avgRating
      const product = await queryRunner.manager.findOne(ProductSpu, {
        where: { id: productId },
        relations: ['reviews'],
      });

      if (!product) {
        throw new HttpException('Sản phẩm không tồn tại', HttpStatus.NOT_FOUND);
      }

      const totalStars = product.reviews.reduce(
        (sum, review) => sum + review.star,
        star,
      );

      const avgRating = totalStars / product.reviews.length;

      product.avgRating = avgRating;
      await queryRunner.manager.save(ProductSpu, product);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Cập nhật review thành công',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Xóa review
  async removeReview(rid: number): Promise<{ message: string }> {
    // Tạo transaction manager
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra sự tồn tại của review bằng `id`
      const existingReview = await queryRunner.manager.findOne(Review, {
        where: { id: rid },
      });

      if (!existingReview) {
        throw new HttpException(
          'Không tìm thấy bình luận',
          HttpStatus.NOT_FOUND,
        );
      }

      const { productId } = existingReview; // Lấy productId từ review cần xóa

      // Xóa review
      await queryRunner.manager.remove(Review, existingReview);

      // Lấy tất cả các review còn lại của sản phẩm
      const remainingReviews = await queryRunner.manager.find(Review, {
        where: { productId },
      });

      // Tính toán lại avgRating
      const avgRating =
        remainingReviews.length > 0
          ? remainingReviews.reduce((sum, review) => sum + review.star, 0) /
            remainingReviews.length
          : 0; // Nếu không còn review, avgRating là 0

      // Cập nhật avgRating cho sản phẩm
      await queryRunner.manager.update(
        ProductSpu,
        { id: productId },
        { avgRating },
      );

      // Commit transaction
      await queryRunner.commitTransaction();
      return { message: 'Xóa bình luận và cập nhật avgRating thành công' };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error; // Ném lại lỗi để controller xử lý
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }

  // reply bình luận
  async replyReviewByAdmin(
    userId: number,
    replyReviewDto: ReplyReviewDto,
  ): Promise<Review> {
    const { productId, comment, parentId } = replyReviewDto;

    // Tìm bình luận cha
    const parentReview = await this.reviewRepository.findOne({
      where: { id: parentId },
    });

    if (!parentReview) {
      throw new HttpException(
        'Bình luận gốc không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật isReply của bình luận cha thành true
    parentReview.isReply = true;
    await this.reviewRepository.save(parentReview);

    // Tạo phản hồi mới
    const newReply = await this.reviewRepository.create({
      productId,
      userId,
      parentId,
      comment,
      isReply: true,
    });

    // Lưu phản hồi mới vào database
    const savedReply = await this.reviewRepository.save(newReply);

    // Trả về phản hồi mới với các quan hệ liên quan
    return this.reviewRepository.findOne({
      where: { id: savedReply.id },
      relations: ['user', 'product'],
    });
  }

  // lấy ra danh sách bình luận
  async getReviews(): Promise<Review[]> {
    const reviews = await this.reviewRepository.find({
      relations: ['user', 'product', 'product.images'],
      select: {
        id: true,
        star: true,
        comment: true,
        isReply: true,
        user: {
          id: true,
          fullName: true,
        },
        product: {
          id: true,
          title: true,
          images: true,
        },
        color: true,
        size: true,
        sku: true,
      },
    });
    return reviews;
  }
}
