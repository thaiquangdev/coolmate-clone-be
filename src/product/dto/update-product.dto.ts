import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkuDto {
  @IsString()
  colorName: string;

  @IsString()
  size: string;

  @IsString()
  sku: string;
}

export class UpdateProductDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsNumber()
  price?: number;

  @IsNumber()
  discount?: number;

  @IsString()
  highlights?: string;

  @IsNumber()
  categoryId?: number;

  @IsNumber()
  subCategoryId?: number;

  @IsOptional()
  @IsNumber()
  collectionId?: number;

  @ValidateNested({ each: true })
  @Type(() => SkuDto)
  skus?: SkuDto[];
}
