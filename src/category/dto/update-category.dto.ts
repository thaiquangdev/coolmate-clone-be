import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  categoryName: string;
}
