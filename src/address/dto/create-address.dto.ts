import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Length(10, 10, { message: 'Số điện thoại phải 10 số' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Thành phố/tỉnh không được để trống' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Quận huyện không được để trống' })
  district: string;

  @IsString()
  @IsNotEmpty({ message: 'Phường xã không được để trống' })
  ward: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã zip không được để trống' })
  zipCode: string;
}
