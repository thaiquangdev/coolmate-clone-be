import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Mã giỏ hàng không được để trống' })
  cartId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Mã địa chỉ không được để trống' })
  addressId: number;

  @ApiProperty()
  @IsString()
  note: string;
}
