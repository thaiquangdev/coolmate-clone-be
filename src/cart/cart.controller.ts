import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateQuantityCartDto } from './dto/update-quantity-cart.dto';
import { Request } from 'express';

@ApiTags('Carts')
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // thêm sản phẩm vào giỏ hàng
  @ApiBearerAuth()
  @Post('/add-to-cart')
  @UseGuards(AuthGuard)
  async addToCart(
    @Req() req: Request,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<{ message: string }> {
    const { id } = req['user'];
    return this.cartService.addToCart(Number(id), addToCartDto);
  }

  // cập nhật số lượng sản phẩm trong giỏ hàng
  @ApiBearerAuth()
  @Put('/update-quantity-cart/')
  @UseGuards(AuthGuard)
  async updateQuantityCart(
    updateQuantityCartDto: UpdateQuantityCartDto,
  ): Promise<{
    message: string;
    cartDetailId: number;
    updatedQuantity: number;
  }> {
    return this.cartService.updateQuantityCart(updateQuantityCartDto);
  }

  // xóa một sản phẩm trong giỏ hàng
  @ApiBearerAuth()
  @Delete('/delete-product-cart/cid')
  @UseGuards(AuthGuard)
  async deleteProductCart(@Param('cid') cid: number) {
    return this.cartService.deleteProductInCart(cid);
  }

  // xóa tất cả sản phẩm
  @ApiBearerAuth()
  @Delete('/delete-products/cart')
  @UseGuards(AuthGuard)
  async deleteProductsCart(@Req() request: Request) {
    const { id } = request['user'];
    return this.cartService.deleteAllProductInCart(Number(id));
  }

  @ApiBearerAuth()
  @Get('/get-carts')
  @UseGuards(AuthGuard)
  async getAllCarts(@Req() req: Request) {
    const { id } = req['user'];
    return this.cartService.getAllCarts(Number(id));
  }
}
