import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { FilterCouponDto } from './dto/filter-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  // tạo mới một mã giảm giá
  async createCoupon(createCouponDto: CreateCouponDto) {
    const {
      couponCode,
      couponQuantity,
      priceDiscount,
      description,
      minOrderValue,
      expire,
    } = createCouponDto;

    // Kiểm tra mã giảm giá có bị trùng không
    const existingCoupon = await this.couponRepository.findOneBy({
      couponCode,
      status: 'active', // Kiểm tra coupon đang hoạt động
    });

    if (existingCoupon) {
      throw new HttpException(
        `Mã giảm giá "${couponCode}" đã tồn tại`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra số lượng mã giảm giá và giá trị giảm giá
    if (couponQuantity <= 0) {
      throw new HttpException(
        'Số lượng mã giảm giá phải lớn hơn 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (priceDiscount <= 0) {
      throw new HttpException(
        'Giá trị giảm giá phải lớn hơn 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (minOrderValue < 0) {
      throw new HttpException(
        'Giá trị đơn hàng tối thiểu không được âm',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra ngày hết hạn hợp lệ
    const currentDate = new Date();
    if (new Date(expire) <= currentDate) {
      throw new HttpException(
        'Ngày hết hạn phải lớn hơn ngày hiện tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tạo mới coupon
    const newCoupon = await this.couponRepository.create({
      couponCode,
      couponQuantity,
      priceDiscount,
      description,
      minOrderValue,
      expire,
      status: 'active', // Đặt trạng thái mặc định là active
    });

    // Lưu vào cơ sở dữ liệu
    return await this.couponRepository.save(newCoupon);
  }

  // cập nhật mã giảm giá
  async updateCoupon(cid: number, updateCouponDto: UpdateCouponDto) {
    const {
      couponCode,
      couponQuantity,
      priceDiscount,
      description,
      minOrderValue,
      expire,
      status,
    } = updateCouponDto;

    // Kiểm tra xem coupon có tồn tại hay không
    const existingCoupon = await this.couponRepository.findOneBy({ id: cid });
    if (!existingCoupon) {
      throw new HttpException(
        `Không tìm thấy mã giảm giá với ID: ${cid}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra dữ liệu đầu vào (các giá trị số và ngày tháng)
    if (couponQuantity !== undefined && couponQuantity < 0) {
      throw new HttpException(
        'Số lượng mã giảm giá phải lớn hơn hoặc bằng 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (priceDiscount !== undefined && priceDiscount < 0) {
      throw new HttpException(
        'Giá trị giảm giá phải lớn hơn hoặc bằng 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (minOrderValue !== undefined && minOrderValue < 0) {
      throw new HttpException(
        'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (expire && new Date(expire) <= new Date()) {
      throw new HttpException(
        'Ngày hết hạn phải nằm trong tương lai',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật các giá trị nếu có trong DTO
    existingCoupon.couponCode = couponCode ?? existingCoupon.couponCode;
    existingCoupon.couponQuantity =
      couponQuantity ?? existingCoupon.couponQuantity;
    existingCoupon.priceDiscount =
      priceDiscount ?? existingCoupon.priceDiscount;
    existingCoupon.description = description ?? existingCoupon.description;
    existingCoupon.minOrderValue =
      minOrderValue ?? existingCoupon.minOrderValue;
    existingCoupon.status = status ?? existingCoupon.status;
    existingCoupon.expire = expire ?? existingCoupon.expire;

    // Lưu cập nhật vào cơ sở dữ liệu
    return await this.couponRepository.save(existingCoupon);
  }

  // lấy danh sách mã giảm giá
  async getCoupons(query: FilterCouponDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const coupons = await this.couponRepository.find({ take: limit, skip });
    return coupons;
  }

  // lấy chi tiết mã giảm giá
  async getCoupon(cid: number) {
    const coupon = await this.couponRepository.findOne({ where: { id: cid } });
    if (!coupon) {
      throw new HttpException(
        `Không tồn tại mã giảm giá với id: ${cid}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return coupon;
  }

  // xóa mã giảm giá
  async deleteCoupon(cid: number) {
    const deleteCoupon = await this.couponRepository.delete(cid);
    if (deleteCoupon.affected === 0) {
      throw new HttpException(
        'Không tìm thấy mã giảm giá',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Trả về thông báo thành công
    return {
      message: 'Xóa mã giảm giá thành công',
    };
  }
}
