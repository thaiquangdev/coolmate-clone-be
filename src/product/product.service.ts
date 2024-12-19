import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSpu } from './entities/product-spu.entity';
import { Like, Repository } from 'typeorm';
import { ProductSku } from './entities/product-sku.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { DataSource } from 'typeorm';
import slugify from 'slugify';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import * as path from 'path';
import * as fs from 'fs';
import { ImportProductStockDto } from './dto/import-product-stock.dto';
import { ProductInventory } from './entities/product-inventory.entity';
import { FilterHistoryInventoryDto } from './dto/filter-history-inventory.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductSpu)
    private readonly productSpuRepository: Repository<ProductSpu>,
    @InjectRepository(ProductSku)
    private readonly productSkuRepository: Repository<ProductSku>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductInventory)
    private readonly productInventoryRepository: Repository<ProductInventory>,
    private readonly dataSource: DataSource,
  ) {}

  // tạo mới một sản phẩm
  async createProduct(
    createProductDto: CreateProductDto,
    images: string[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        title,
        description,
        price,
        highlights,
        categoryId,
        collectionId,
        subCategoryId,
        skus,
      } = createProductDto;
      const slug = slugify(title);

      const spu = await queryRunner.manager.findOne(ProductSpu, {
        where: { slug },
      });
      if (spu) {
        for (const image of images) {
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
          'Sản phẩm này đã tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tạo mới SPU
      const newSpu = queryRunner.manager.create(ProductSpu, {
        title,
        slug,
        description,
        highlights,
        price,
        categoryId,
        subCategoryId,
        collectionId,
      });
      await queryRunner.manager.save(newSpu);

      // Tạo mới SKU
      for (const item of skus) {
        const { colorName, size, sku } = item;
        const newSku = queryRunner.manager.create(ProductSku, {
          colorName,
          sku,
          size,
          productSpuId: Number(newSpu.id),
        });
        await queryRunner.manager.save(newSku);
      }

      // Tạo mới Image
      for (const image of images) {
        const newImage = queryRunner.manager.create(ProductImage, {
          url: image,
          productSpuId: Number(newSpu.id),
        });
        await queryRunner.manager.save(newImage);
      }

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // lấy ra thông tin chi tiết sản phẩm
  async getDetail(slug: string): Promise<ProductSpu> {
    const product = await this.productSpuRepository.findOne({
      where: { slug },
      relations: ['images', 'skus'],
    });
    if (!product) {
      throw new HttpException(
        'Không tìm thấy sản phẩm',
        HttpStatus.BAD_REQUEST,
      );
    }
    return product;
  }

  // lấy ra tất cả sản phẩm
  async getProduct(query: FilterProductDto): Promise<{
    data: ProductSpu[];
    total: number;
    page: number;
    limit: number;
  }> {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const where: { [key: string]: any } = {};

    if (query.search) {
      where.title = Like('%' + query.search + '%');
    }

    if (query.subCategoryId) {
      where.subCategoryId = query.subCategoryId;
    }

    if (query.collectionId) {
      where.collectionId = query.collectionId;
    }

    const [res, total] = await this.productSpuRepository.findAndCount({
      where,
      take: limit,
      skip,
      relations: ['collection', 'category', 'subCategory', 'images', 'skus'],
    });
    return { data: res, total, page, limit };
  }

  // cập nhật sản phẩm
  async updateProduct(
    slug: string,
    updateProductDto: UpdateProductDto,
    images: string[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        title,
        description,
        price,
        highlights,
        categoryId,
        collectionId,
        subCategoryId,
        skus,
      } = updateProductDto;
      const product = await queryRunner.manager.findOne(ProductSpu, {
        where: { slug },
        relations: ['images', 'skus'],
      });
      if (!product) {
        throw new HttpException(
          'Không tìm thấy sản phẩm',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Cập nhật thông tin SPU
      if (title) product.title = title;
      if (description) product.description = description;
      if (price) product.price = price;
      if (highlights) product.highlights = highlights;
      if (categoryId) product.categoryId = categoryId;
      if (subCategoryId) product.subCategoryId = subCategoryId;
      if (collectionId) product.collectionId = collectionId;

      // Lưu SPU sau khi cập nhật
      await queryRunner.manager.save(ProductSpu, product);

      // nếu như có skus
      if (skus && skus.length >= product.skus.length) {
        for (const sku of skus) {
          if (sku.sku) {
            const productSku = await queryRunner.manager.findOne(ProductSku, {
              where: { sku: sku.sku },
            });
            if (productSku) {
              productSku.colorName = sku.colorName || productSku.colorName;
              productSku.size = sku.size || productSku.size;
              await queryRunner.manager.save(productSku);
            } else {
              const newSku = queryRunner.manager.create(ProductSku, {
                colorName: sku.colorName,
                sku: sku.sku,
                size: sku.size,
              });
              await queryRunner.manager.save(newSku);
            }
          }
        }
      } else {
        const skusToDelete = product.skus.filter((dbSku) => {
          return !skus.some((sku) => sku.sku === dbSku.sku);
        });
        for (const skuToDelete of skusToDelete) {
          await queryRunner.manager.delete(ProductSku, {
            sku: skuToDelete.sku,
          });
        }
      }

      // nếu như có ảnh
      if (images) {
        for (const image of images) {
          const productImage = await queryRunner.manager.findOne(ProductImage, {
            where: { url: image },
          });
          if (!productImage) {
            const newImage = await queryRunner.manager.create(ProductImage, {
              url: image,
              productSpuId: Number(product.id),
            });
            await queryRunner.manager.save(newImage);
          }
        }

        // Lọc ra những ảnh có trong DB nhưng không có trong images truyền lên
        const imagesToDelete = product.images.filter((dbImage) => {
          return !images.includes(dbImage.url);
        });

        // Xóa các ảnh không có trong images
        for (const imageToDelete of imagesToDelete) {
          // Xóa ảnh khỏi DB
          await queryRunner.manager.delete(ProductImage, {
            url: imageToDelete.url,
          });
        }
      }

      // commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // xóa sản phẩm
  async deleteProduct() {}

  // quản lý kho
  // nhập xuất sửa kho
  async importProductStock(importProductStockDto: ImportProductStockDto) {
    const { productSkuId, quantityChange, changeType, note } =
      importProductStockDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm SKU
      const sku = await queryRunner.manager.findOne(ProductSku, {
        where: { id: productSkuId },
      });
      if (!sku) {
        throw new HttpException(
          `Không tìm thấy SKU với id: ${productSkuId}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Lấy bản ghi tồn kho gần nhất
      const lastInventory = await queryRunner.manager.findOne(
        ProductInventory,
        {
          where: { productSkuId },
          order: { createdAt: 'DESC' },
        },
      );

      const previousRemainingStock = lastInventory
        ? lastInventory.remainingStock
        : 0;
      let newRemainingStock = previousRemainingStock;

      // Xử lý theo loại thay đổi
      switch (changeType) {
        case 'import':
          newRemainingStock += quantityChange;
          sku.quantity += quantityChange;
          break;
        case 'export':
          if (quantityChange > previousRemainingStock) {
            throw new HttpException(
              `Không đủ tồn kho để xuất. Tồn kho hiện tại: ${previousRemainingStock}`,
              HttpStatus.BAD_REQUEST,
            );
          }
          newRemainingStock -= quantityChange;
          sku.quantity -= quantityChange;
          break;
        case 'adjust':
          newRemainingStock = quantityChange;
          sku.quantity = quantityChange;
          break;
        default:
          throw new HttpException(
            'Loại thay đổi không hợp lệ',
            HttpStatus.BAD_REQUEST,
          );
      }

      // Tạo bản ghi tồn kho mới
      const inventory = queryRunner.manager.create(ProductInventory, {
        productSkuId,
        changeType,
        quantityChange,
        note,
        remainingStock: newRemainingStock,
      });

      // Lưu dữ liệu
      await queryRunner.manager.save(sku);
      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();
      return { sku, inventory };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // lịch sử nhập - xuất kho
  async getStocksList(query: FilterHistoryInventoryDto): Promise<{
    data: ProductInventory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.productInventoryRepository.findAndCount({
      relations: ['productSku'],
      select: {
        id: true,
        changeType: true,
        quantityChange: true,
        remainingStock: true,
        note: true,
        productSku: {
          sku: true,
        },
        createdAt: true,
      },
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  // lấy ra danh sách sản phẩm với số lượng trong kho
  async getProductStocks(): Promise<ProductSpu[]> {
    const products = await this.productSpuRepository.find({
      relations: ['skus', 'images'],
      select: {
        id: true,
        title: true, // Nếu cần thêm tên sản phẩm
        images: true,
        skus: {
          id: true,
          quantity: true,
        },
      },
    });
    return products;
  }
}
