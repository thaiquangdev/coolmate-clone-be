import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên bộ sưu tập không được để trống' })
  @IsString()
  collectionName: string;

  @ApiProperty()
  @IsString()
  description?: string;
}
