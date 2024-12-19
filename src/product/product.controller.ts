import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { storageConfig } from 'src/helpers/config';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { ProductSpu } from './entities/product-spu.entity';
import { RoleEnums } from 'src/helpers/enum';
import { Roles } from 'src/decorators/roles.decorator';
import { Authorize } from 'src/auth/autho.guard';
import { FilterProductDto } from './dto/filter-product.dto';
import { ImportProductStockDto } from './dto/import-product-stock.dto';
import { ProductInventory } from './entities/product-inventory.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductSku } from './entities/product-sku.entity';
import { FilterHistoryInventoryDto } from './dto/filter-history-inventory.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @Post('create-product')
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @UseInterceptors(
    FilesInterceptor('image-product', 10, {
      storage: storageConfig('image-product'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với các đuôi ${allowedExtArr.join(', ')}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `Lỗi khi upload ảnh, ảnh chỉ hỗ trợ upload với ảnh dưới 5MB`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ): Promise<{ success: boolean; message: string; data: void }> {
    console.log(files);
    // Xử lý danh sách file
    const imageUrls = files.map(
      (file: { fieldname: string; filename: string }) =>
        file.fieldname + '/' + file.filename,
    );
    if (typeof createProductDto.skus === 'string') {
      createProductDto.skus = JSON.parse(createProductDto.skus);
    }
    const result = await this.productService.createProduct(
      createProductDto,
      imageUrls,
    );
    return {
      success: true,
      message: 'Tạo mới sản phẩm thành công',
      data: result,
    };
  }

  @Get('/get-product/:slug')
  async getProduct(
    @Param('slug') slug: string,
  ): Promise<{ success: true; data: ProductSpu }> {
    const result = await this.productService.getDetail(slug);
    return { success: true, data: result };
  }

  @Get('/get-products')
  async getProducts(@Query() query: FilterProductDto): Promise<{
    data: ProductSpu[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.productService.getProduct(query);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Post('/import-stock')
  async importProductStock(
    @Body() importProductStockDto: ImportProductStockDto,
  ): Promise<{ sku: ProductSku; inventory: ProductInventory }> {
    return await this.productService.importProductStock(importProductStockDto);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Get('/get-stock-list')
  async getStocksList(@Query() query: FilterHistoryInventoryDto): Promise<{
    data: ProductInventory[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.productService.getStocksList(query);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Get('/get-product-stock')
  async getProductStock(): Promise<ProductSpu[]> {
    return await this.productService.getProductStocks();
  }
}
