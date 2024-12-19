import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from './entities/subCategory.entity';
import { Like, Repository } from 'typeorm';
import { CreateSubcategoryDto } from './dto/create-sub-category.dto';
import slugify from 'slugify';
import { UpdateSubcategoryDto } from './dto/update-sub-categories';
import * as path from 'path';
import * as fs from 'fs';
import { FilterSubCategoryDto } from './dto/filter-sub-category.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryService: Repository<SubCategory>,
  ) {}

  // thêm mới một danh mục con
  async createSubCategory(
    createSubCategoryDto: CreateSubcategoryDto,
    image: string,
  ): Promise<SubCategory> {
    const { subCategoryName, categoryId } = createSubCategoryDto;
    const subCategorySlug = slugify(subCategoryName);
    // kiểm tra danh mục con đã tồn tại chưa
    const subCategory = await this.subCategoryService.findOneBy({
      subCategorySlug,
    });

    if (subCategory) {
      if (image) {
        const filePath = path.join(process.cwd(), 'uploads', image);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Lỗi khi xóa file: ${err.message}`);
          } else {
            console.log(`File ${filePath} đã được xóa`);
          }
        });
      }
      throw new HttpException(
        'Danh mục con đã tồnt tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newSubCategory = await this.subCategoryService.create({
      subCategoryName,
      subCategorySlug,
      image,
      categoryId: Number(categoryId),
    });

    return await this.subCategoryService.save(newSubCategory);
  }

  // lấy thông tin chi tiết danh mục con
  async getDetailSubCategory(slug: string): Promise<SubCategory> {
    const category = await this.subCategoryService.findOne({
      where: { subCategorySlug: slug },
      relations: ['category'],
    });
    if (!category) {
      throw new HttpException(
        'Danh mục con không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }
    return category;
  }

  // lấy tất cả danh mục con
  async getSubCategories(query: FilterSubCategoryDto): Promise<{
    res: SubCategory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const categoryId = Number(query.categoryId);

    const where: { [key: string]: any } = {};

    if (query.search) {
      where.subCategoryName = Like('%' + query.search + '%');
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const [res, total] = await this.subCategoryService.findAndCount({
      where,
      take: limit,
      skip,
      relations: ['category'],
    });
    return { res, total, page, limit };
  }

  // sửa danh mục con
  async updateSubCategory(
    slug: string,
    updateSubCategory: UpdateSubcategoryDto,
    image?: string,
  ): Promise<SubCategory> {
    const { categoryId, subCategoryName } = updateSubCategory;
    const subCategory = await this.subCategoryService.findOne({
      where: { subCategorySlug: slug },
    });
    if (!subCategory) {
      throw new HttpException(
        'Không tìm thấy danh mục con',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (subCategory.image) {
      const filePath = path.join(process.cwd(), 'uploads', subCategory.image);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Lỗi khi xóa file: ${err.message}`);
        } else {
          console.log(`File ${filePath} đã được xóa`);
        }
      });
    }
    subCategory.subCategoryName =
      subCategoryName || subCategory.subCategoryName;
    subCategory.categoryId = Number(categoryId) || subCategory.categoryId;
    subCategory.image = image || subCategory.image;
    return await this.subCategoryService.save(subCategory);
  }

  // xóa danh mục con
  async deleteSubCategory(slug: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryService.findOne({
      where: { subCategorySlug: slug },
    });
    if (!subCategory) {
      throw new HttpException(
        'Không tìm thấy danh mục con',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (subCategory.image) {
      const filePath = path.join(process.cwd(), subCategory.image);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Lỗi khi xóa file: ${err.message}`);
        } else {
          console.log(`File ${filePath} đã được xóa`);
        }
      });
    }
    return await this.subCategoryService.remove(subCategory);
  }
}
