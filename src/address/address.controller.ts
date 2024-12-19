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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // tạo mới địa chỉ
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('create-address')
  async createAddress(
    @Req() req: Request,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const { id } = req['user'];
    return await this.addressService.createAddress(
      Number(id),
      createAddressDto,
    );
  }

  // cập nhật địa chỉ
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('update-address/:aid')
  async updateAddress(
    @Param('aid') aid: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(aid, updateAddressDto);
  }

  // xóa địa chỉ
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('delete-address/:aid')
  async deleteAddress(@Req() req: Request, @Param('aid') aid: number) {
    const { id } = req['user'];
    return this.addressService.deleteAddress(Number(id), aid);
  }

  // lấy danh sách địa chỉ
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('get-addresses')
  async getAddresses(@Req() req: Request) {
    const { id } = req['user'];
    return this.addressService.getAddresses(Number(id));
  }

  // lấy chi tiết địa chỉ
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('get-address/:aid')
  async getAddress(@Param('aid') aid: number, @Req() req: Request) {
    const { id } = req['user'];
    return this.addressService.getAddress(aid, Number(id));
  }
}
