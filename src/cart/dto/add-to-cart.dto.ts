import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Mã sản phẩm bắt buộc có' })
  productId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Bạn chưa chọn size' })
  size: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Bạn chưa chọn màu' })
  color: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Bạn chưa nhập số lượng' })
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Mã sku bắt buộc có' })
  sku: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Giá bắt buộc có' })
  price: number;
}
