import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  // tạo mới một danh mục
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { categoryName } = createCategoryDto;
    const categorySlug = slugify(categoryName);
    // kiểm tra xem danh mục đã tồn tại chưa
    const category = await this.categoryRepository.findOneBy({ categorySlug });
    if (category) {
      throw new HttpException('Danh mục đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newCategory = await this.categoryRepository.create({
      categoryName,
      categorySlug,
    });
    return await this.categoryRepository.save(newCategory);
  }

  // cập nhật một danh mục
  async updateCategory(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const { categoryName } = updateCategoryDto;
    const categorySlug = slugify(categoryName);
    // kiểm tra xem danh mục đã tồn tại chưa
    const category = await this.categoryRepository.findOneBy({
      categorySlug: slug,
    });
    if (!category) {
      throw new HttpException(
        'Không tìm thấy danh mục',
        HttpStatus.BAD_REQUEST,
      );
    }

    category.categoryName = categoryName || category.categoryName;
    category.categorySlug = categorySlug || category.categorySlug;
    return await this.categoryRepository.save(category);
  }

  // lấy thông tin chi tiết của một danh mục
  async getDetailCategory(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { categorySlug: slug },
      relations: ['subCategories'],
    });
    if (!category) {
      throw new HttpException(
        'Không tìm thấy danh mục',
        HttpStatus.BAD_REQUEST,
      );
    }

    return category;
  }

  // lấy tất cả danh mục
  async getCategories(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['subCategories'],
    });
    return categories;
  }

  // xóa một danh mục
  async deleteCategory(slug: string): Promise<DeleteResult> {
    const category = await this.categoryRepository.findOne({
      where: { categorySlug: slug },
    });
    if (!category) {
      throw new HttpException(
        'Không tìm thấy danh mục',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.categoryRepository.delete(category);
  }
}
