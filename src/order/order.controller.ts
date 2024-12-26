import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Request } from 'express';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilterOrderDto } from './dto/filter-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // thanh toán cod
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('/checkout-cod')
  async checkOutCod(@Req() req: Request, @Body() checkoutDto: CheckoutDto) {
    const { id } = req['user'];
    return this.orderService.checkoutCod(Number(id), checkoutDto);
  }

  // thanh toán zalopay
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('/checkout-zalopay')
  async checkOutZaloPay(@Req() req: Request, @Body() checkoutDto: CheckoutDto) {
    const { id } = req['user'];
    return this.orderService.checkoutZaloPay(Number(id), checkoutDto);
  }

  @Post('/callback-zalopay')
  async callBackZalopay(@Body() body: any) {
    const result = await this.orderService.handleZalopayCallback(body);
    return result;
  }

  @Get('/get-orders')
  @UseGuards(AuthGuard)
  async getOrders(@Query() query: FilterOrderDto) {
    return this.orderService.getOrders(query);
  }
}
