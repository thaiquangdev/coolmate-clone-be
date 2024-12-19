import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { dataSourceOptions } from 'db/data-source';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { JwtService } from '@nestjs/jwt';
import { CollectionModule } from './collection/collection.module';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from './upload/upload.module';
import { CartModule } from './cart/cart.module';
import { CouponModule } from './coupon/coupon.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../uploads'), // Đường dẫn tới thư mục chứa tài nguyên tĩnh
    }),
    UserModule,
    AuthModule,
    MailModule,
    CategoryModule,
    SubCategoryModule,
    CollectionModule,
    ProductModule,
    RoleModule,
    UploadModule,
    CartModule,
    CouponModule,
    AddressModule,
    OrderModule,
  ],
  providers: [MailService, JwtService],
  controllers: [],
})
export class AppModule {}
