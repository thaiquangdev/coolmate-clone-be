import { IsEmail, IsString, Length } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  @Length(10, 10, { message: 'Số điện thoại phải 10 số' })
  phoneNumber: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  zipCode: string;
}
