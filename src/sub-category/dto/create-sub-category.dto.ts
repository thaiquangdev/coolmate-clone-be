import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên danh mục con không được để trống' })
  @IsString()
  subCategoryName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mã ID danh mục không được để trống' })
  @IsNumber()
  categoryId: string;
}
