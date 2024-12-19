import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSpu } from './entities/product-spu.entity';
import { ProductSku } from './entities/product-sku.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductInventory } from './entities/product-inventory.entity';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductSpu,
      ProductSku,
      ProductImage,
      ProductInventory,
      User,
    ]),
    JwtModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
