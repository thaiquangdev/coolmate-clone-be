import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { storageConfig } from 'src/helpers/config';
import { CreateSubcategoryDto } from './dto/create-sub-category.dto';
import { SubCategoryService } from './sub-category.service';
import { SubCategory } from './entities/subCategory.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { UpdateSubcategoryDto } from './dto/update-sub-categories';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';
import { Authorize } from 'src/auth/autho.guard';
import { FilterSubCategoryDto } from './dto/filter-sub-category.dto';

@ApiTags('Sub-categories')
@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @ApiBearerAuth()
  @Post('create-sub-category')
  @ApiResponse({ status: 201, description: 'Tạo mới danh mục con thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi khi tạo mới danh mục con' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @UseInterceptors(
    FileInterceptor('image-subcategory', {
      storage: storageConfig('image-subcategory'),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase(); // ToLowerCase để xử lý đúng đuôi file
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với các đuôi ${allowedExtArr.join(', ')}`;
          callback(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            // 5MB
            req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với ảnh dưới 5MB`;
            callback(null, false);
          } else {
            callback(null, true);
          }
        }
      },
    }),
  )
  async createSubCategory(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createSubCategoryDto: CreateSubcategoryDto,
  ): Promise<{ success: boolean; message: string; data: SubCategory }> {
    console.log(file);
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('Bắt buộc có ảnh');
    }
    const result = await this.subCategoryService.createSubCategory(
      createSubCategoryDto,
      file.fieldname + '/' + file.filename,
    );
    return {
      success: true,
      message: 'Tạo mới danh mục thành công',
      data: result,
    };
  }

  @Get('get-sub-categories')
  async getSubCategories(@Query() query: FilterSubCategoryDto): Promise<{
    res: SubCategory[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.subCategoryService.getSubCategories(query);
  }

  @Get('get-sub-category/:slug')
  async getSubCategory(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; data: SubCategory }> {
    const result = await this.subCategoryService.getDetailSubCategory(slug);
    return { success: true, data: result };
  }

  @ApiBearerAuth()
  @Put('update-sub-category/:slug')
  @ApiResponse({ status: 200, description: 'Sửa danh mục con thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi khi sửa danh mục con' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storageConfig('image-subcategory'),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase(); // ToLowerCase để xử lý đúng đuôi file
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với các đuôi ${allowedExtArr.join(', ')}`;
          callback(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            // 5MB
            req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với ảnh dưới 5MB`;
            callback(null, false);
          } else {
            callback(null, true);
          }
        }
      },
    }),
  )
  async updateSubCategory(
    @Req() req: any,
    @Param('slug') slug: string,
    updateSubCategoryDto: UpdateSubcategoryDto,
    file: Express.Multer.File,
  ): Promise<{ success: boolean; message: string; data: SubCategory }> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    const result = await this.subCategoryService.updateSubCategory(
      slug,
      updateSubCategoryDto,
      file.fieldname + '/' + file.fieldname,
    );
    return {
      success: true,
      message: 'Cập nhật danh mục con thành công',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Xóa danh mục con thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi khi xóa mới danh mục con' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Delete('delete-sub-category/:slug')
  async deleteSubCategory(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; message: string; data: SubCategory }> {
    const result = await this.subCategoryService.deleteSubCategory(slug);
    return {
      success: true,
      message: 'Xóa danh mục con thành công',
      data: result,
    };
  }
}
