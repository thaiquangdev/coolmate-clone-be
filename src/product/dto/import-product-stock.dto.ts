import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImportProductStockDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Số lượng bắt buộc có' })
  quantityChange: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn nhập hoặc xuất' })
  changeType: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Vui lòng nhập mã sku' })
  productSkuId: number;

  @ApiProperty()
  note?: string;
}
