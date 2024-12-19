import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateSubcategoryDto {
  @ApiProperty()
  @IsString()
  subCategoryName: string;

  @ApiProperty()
  @IsNumber()
  categoryId: string;
}
