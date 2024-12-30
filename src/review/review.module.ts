import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProductSpu } from 'src/product/entities/product-spu.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ProductSpu, User]), JwtModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
