import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateCouponDto {
  @IsString()
  couponCode: string;

  @IsNumber()
  couponQuantity: number;

  @IsNumber()
  priceDiscount: number;

  @IsString()
  description: string;

  @IsNumber()
  minOrderValue: number;

  @IsString()
  status: string;

  @IsDate()
  expire: Date;
}
