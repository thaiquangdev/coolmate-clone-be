import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Bình luận không được để trống' })
  comment: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Đánh giá số sao không được để trống' })
  star: number;
}
