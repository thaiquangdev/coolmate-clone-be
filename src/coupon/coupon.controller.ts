import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FilterCouponDto } from './dto/filter-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { Authorize } from 'src/auth/autho.guard';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // tạo mới mã giảm giá
  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Post('/create-coupon')
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.createCoupon(createCouponDto);
  }

  // xem danh sách mã giảm giá
  @Get('/get-coupons')
  async getCoupons(@Query() query: FilterCouponDto) {
    return this.couponService.getCoupons(query);
  }

  // xem chi tiết mã giảm giá
  @Get('/get-coupon/:cid')
  async getCoupon(@Param('cid') cid: number) {
    return this.couponService.getCoupon(cid);
  }

  // cập nhật mã giảm giá
  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Put('/update-coupon/:cid')
  async updateCoupon(
    @Param('cid') cid: number,
    updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(cid, updateCouponDto);
  }

  // xóa mã giảm giá
  @ApiBearerAuth()
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Delete('/delete-coupon/:cid')
  async deleteCoupon(@Param('cid') cid: number) {
    return this.couponService.deleteCoupon(cid);
  }
}
