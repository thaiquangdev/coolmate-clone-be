import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteResult } from 'typeorm';
import { RoleEnums } from 'src/helpers/enum';
import { Roles } from 'src/decorators/roles.decorator';
import { Authorize } from 'src/auth/autho.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categorySerivce: CategoryService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo mới danh mục thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi khi tạo mới danh mục' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Post('create-category')
  async createCategoryDto(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<{ success: boolean; message: string; data: Category }> {
    const result = await this.categorySerivce.createCategory(createCategoryDto);
    return {
      success: true,
      message: 'Tạo mới danh mục thành công',
      data: result,
    };
  }

  @Get('get-category/:slug')
  async getCategory(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; data: Category }> {
    const result = await this.categorySerivce.getDetailCategory(slug);
    return {
      success: true,
      data: result,
    };
  }

  @Get('get-categories')
  async getCategories(): Promise<{ success: true; data: Category[] }> {
    const result = await this.categorySerivce.getCategories();
    return { success: true, data: result };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 202, description: 'Sửa danh mục thành công ' })
  @ApiResponse({ status: 401, description: 'Sửa danh mục thất bại' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Put('udpate-category/:slug')
  async updateCategory(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ success: boolean; message: string; data: Category }> {
    const result = await this.categorySerivce.updateCategory(
      slug,
      updateCategoryDto,
    );
    return { success: true, message: 'Sửa danh mục thành công', data: result };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 202, description: 'Xóa danh mục thành công ' })
  @ApiResponse({ status: 401, description: 'Xóa danh mục thất bại' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Delete('delete-category/:slug')
  async deleteCategory(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; message: string; data: DeleteResult }> {
    const result = await this.categorySerivce.deleteCategory(slug);
    return { success: true, message: 'Xóa danh mục thành công', data: result };
  }
}
