import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { storageConfig } from 'src/helpers/config';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionService } from './collection.service';
import { Collection } from './entities/collection.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';
import { Authorize } from 'src/auth/autho.guard';

@ApiTags('Collections')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @ApiBearerAuth()
  @Post('create-collection')
  @ApiResponse({ status: 201, description: 'Tạo mới bộ sưu tập thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi khi tạo mới bộ sưu tập' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @UseInterceptors(
    FileInterceptor('image-collection', {
      storage: storageConfig('image-collection'),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với các đuôi ${allowedExtArr.toString()}`;
          callback(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với ảnh dưới 5MB`;
            callback(null, false);
          } else {
            callback(null, true);
          }
        }
      },
    }),
  )
  async createCollection(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<{ success: boolean; message: string; data: Collection }> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    if (!file) {
      throw new BadRequestException('Bất buộc có ảnh');
    }

    const result = await this.collectionService.createCollection(
      createCollectionDto,
      file.fieldname + '/' + file.filename,
    );

    return {
      success: true,
      message: 'Tạo mới bộ sưu tập thành công',
      data: result,
    };
  }

  @Get('get-collections')
  async getCollections(): Promise<{ success: boolean; data: Collection[] }> {
    const result = await this.collectionService.getCollections();
    return { success: true, data: result };
  }

  @Get('get-collection/:slug')
  async getCollection(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; data: Collection }> {
    const result = await this.collectionService.getDetailCollection(slug);
    return {
      success: true,
      data: result,
    };
  }
}
