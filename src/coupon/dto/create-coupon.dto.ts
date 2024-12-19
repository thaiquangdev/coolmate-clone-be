import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: 'Code mã giảm giá không được để trống' })
  couponCode: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  couponQuantity: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Giá giảm không được để trống' })
  priceDiscount: number;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Tổng đơn hàng được áp dụng không được để trống' })
  minOrderValue: number;

  @IsDate()
  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống' })
  expire: Date;
}
