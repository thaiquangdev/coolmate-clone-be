import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import { extname, parse } from 'path';
import { storageConfig } from 'src/helpers/config';

@Controller('uploads')
export class UploadController {
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image-description', {
      storage: storageConfig('image-description'),
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
  uploadImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ filePath: string }> {
    // Kiểm tra lỗi nếu có
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    if (!file) {
      throw new BadRequestException('Bất buộc có ảnh');
    }

    // Trả về URL đầy đủ của ảnh
    return Promise.resolve({
      filePath: file.fieldname + '/' + file.filename,
    });
  }

  @Delete('delete-image')
  async deleteImage(@Body() body: { src: string }) {
    const { src } = body;

    // Đảm bảo chỉ xóa file trong thư mục `uploads`
    const fileName = parse(src).base;
    const filePath = `./uploads/image-description/${fileName}`;

    try {
      // Kiểm tra filePath có nằm trong thư mục hợp lệ không
      if (!filePath.startsWith('./uploads')) {
        throw new BadRequestException('Invalid file path');
      }

      await unlink(filePath);
      return { message: 'Xóa file thành công' };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'An error occurred while deleting the file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
