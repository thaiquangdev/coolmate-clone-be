import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Mật khâu cũ không được để trống' })
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Mật khâu mới không được để trống' })
  newPassword: string;
}
