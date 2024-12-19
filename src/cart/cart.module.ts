import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart-detail.entity';
import { JwtModule } from '@nestjs/jwt';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDetail, Coupon]), JwtModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
