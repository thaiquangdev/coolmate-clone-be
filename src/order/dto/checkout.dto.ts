import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'Phương thức thanh toán' })
  @IsString()
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: string;

  @ApiProperty({ description: 'Mã giỏ hàng' })
  @IsNumber()
  @IsNotEmpty({ message: 'Mã giỏ hàng không được để trống' })
  cartId: number;

  @ApiProperty({ description: 'Mã địa chỉ' })
  @IsNumber()
  @IsNotEmpty({ message: 'Mã địa chỉ không được để trống' })
  addressId: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsString()
  @IsOptional() // Cho phép giá trị này là null hoặc undefined
  note?: string;
}
