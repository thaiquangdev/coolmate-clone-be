import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Min, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Min(10, { message: 'Tên tối thiểu là 10 ký tự' })
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu tối thiểu phải 6 ký tự' })
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(10, 10, { message: 'Số điện thoại là 10 ký tự' })
  phoneNumber: string;
}
