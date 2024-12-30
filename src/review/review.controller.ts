import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { Request } from 'express';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { Review } from './entities/review.entity';
import { Authorize } from 'src/auth/autho.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // tạo mới review
  @ApiBearerAuth()
  @Post('/create-review')
  @UseGuards(AuthGuard)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const { id } = req['user'];
    return this.reviewService.createOrUpdateReview(Number(id), createReviewDto);
  }

  // cập nhật review
  @ApiBearerAuth()
  @Put('/update-review')
  @UseGuards(AuthGuard)
  async updateReview(
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const { id } = req['user'];
    return this.reviewService.editReview(Number(id), updateReviewDto);
  }

  // xóa review
  @ApiBearerAuth()
  @Delete('/delete-review/:rid')
  @UseGuards(AuthGuard)
  async deleteReview(@Param('rid') rid: number): Promise<{ message: string }> {
    return this.reviewService.removeReview(rid);
  }

  // reply
  @ApiBearerAuth()
  @Post('/reply-review')
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  async replyReview(
    @Req() req: Request,
    @Body() replyReviewDto: ReplyReviewDto,
  ): Promise<Review> {
    const { id } = req['user'];
    return this.reviewService.replyReviewByAdmin(Number(id), replyReviewDto);
  }

  // lấy ra danh sách bình luận
  @ApiBearerAuth()
  @Get('/get-reviews')
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  async getAllReview(): Promise<Review[]> {
    return this.reviewService.getReviews();
  }
}
