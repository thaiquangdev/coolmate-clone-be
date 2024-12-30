import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { Address } from 'src/address/entities/address.entity';

import axios from 'axios';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}
  // thanh toán tiền mặt
  async checkoutCod(userId: number, checkoutDto: CheckoutDto) {
    const { cartId, addressId, paymentMethod, note } = checkoutDto;
    // tạo transaction manager
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // kiểm tra sự tồn tại của giỏ hàng
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: cartId, userId },
      });
      if (!cart) {
        throw new HttpException(
          'Giỏ hàng không tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }

      // kiểm tra sự tồn tại của địa chỉ
      const address = await queryRunner.manager.findOne(Address, {
        where: { id: addressId, userId },
      });
      if (!address) {
        throw new HttpException('Địa chỉ không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      // tạo mã đơn hàng sử dụng UUID hoặc chuỗi ngẫu nhiên
      const orderCode = `ORDER-${Date.now()}-${Math.random() * 1000}`;

      // tạo đơn hàng
      const newOrder = await queryRunner.manager.create(Order, {
        orderCode,
        paymentMethod,
        paymentStatus: 'đang chờ', // COD thường là pending đến khi giao hàng thành
        cartId,
        addressId,
        note,
      });

      await queryRunner.manager.save(Order, newOrder);

      // đánh dấu giỏ hàng đã thanh toán
      cart.isActive = false;
      await queryRunner.manager.save(Cart, cart);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Thanh toán COD thành công',
        orderId: newOrder.id,
        orderCode: newOrder.orderCode,
      };
    } catch (error) {
      // rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // đóng querryRunner
      await queryRunner.release();
    }
  }

  // thanh toán bằng zalopay
  async checkoutZaloPay(userId: number, checkoutDto: CheckoutDto) {
    const { cartId, addressId, note } = checkoutDto;

    // Cấu hình ZaloPay
    const config = {
      app_id: '2553',
      key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
      endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    };

    // Khởi tạo transaction manager
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra giỏ hàng tồn tại và hợp lệ
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: cartId, userId },
      });
      if (!cart) {
        throw new HttpException(
          'Giỏ hàng không tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra địa chỉ tồn tại và hợp lệ
      const address = await queryRunner.manager.findOne(Address, {
        where: { id: addressId, userId },
      });
      if (!address) {
        throw new HttpException('Địa chỉ không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      // Tạo thông tin giao dịch ZaloPay
      const transID = Math.floor(Math.random() * 1000000);
      const orderCode = `ORDER-${Math.random() * 1000}`;
      const embed_data = { redirectUrl: 'https://your-redirect-url.com' };
      const items = []; // Danh sách sản phẩm trong đơn hàng (có thể tùy chỉnh)

      const orderRequest = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // ID giao dịch
        app_user: `user_${userId}`,
        app_time: Date.now(), // Thời gian tạo giao dịch (miliseconds)
        amount: cart.totalAmount,
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        description: `Thanh toán đơn hàng #${orderCode}`,
        mac: '', // Sẽ được tính sau
        callback_url: '',
      };

      // Tạo chuỗi ký MAC (HMAC SHA256)
      const data = [
        orderRequest.app_id,
        orderRequest.app_trans_id,
        orderRequest.app_user,
        orderRequest.amount,
        orderRequest.app_time,
        orderRequest.embed_data,
        orderRequest.item,
      ].join('|');

      orderRequest.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      // Gửi yêu cầu đến ZaloPay
      const zalopayResponse = await axios.post(config.endpoint, null, {
        params: orderRequest,
      });

      if (!zalopayResponse.data || zalopayResponse.data.return_code !== 1) {
        throw new HttpException(
          'Giao dịch ZaloPay thất bại',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Tạo đơn hàng trong cơ sở dữ liệu
      const newOrder = await queryRunner.manager.create(Order, {
        orderCode,
        paymentMethod: 'zalopay',
        paymentStatus: 'pending', // Đợi xác nhận từ ZaloPay
        cartId,
        addressId,
        note,
        transactionId: String(transID),
        paymentUrl: zalopayResponse.data.order_url,
        paymentDate: new Date(),
      });

      await queryRunner.manager.save(Order, newOrder);

      // Cập nhật trạng thái giỏ hàng
      cart.isActive = false;
      await queryRunner.manager.save(Cart, cart);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về phản hồi thành công
      return {
        message:
          'Tạo đơn hàng thành công, vui lòng hoàn thành thanh toán qua ZaloPay',
        paymentUrl: zalopayResponse.data.order_url,
        orderId: newOrder.id,
        orderCode: newOrder.orderCode,
      };
    } catch (error) {
      // Rollback transaction khi xảy ra lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Đóng queryRunner
      await queryRunner.release();
    }
  }

  async handleZalopayCallback(
    body: any,
  ): Promise<{ return_code: number; return_message: string }> {
    const config = {
      key2: 'eG4r0GcoNtRGbO8',
    };

    const result: { return_code: number; return_message: string } = {
      return_code: 0,
      return_message: '',
    };

    try {
      const { data: dataStr, mac: reqMac } = body;

      // Kiểm tra MAC hợp lệ
      const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      if (reqMac !== mac) {
        result.return_code = -1;
        result.return_message = 'MAC không hợp lệ';
        return result;
      }

      const dataJson = JSON.parse(dataStr);

      // Xử lý thanh toán thành công
      if (dataJson['status'] === '1') {
        const order = await this.orderRepository.findOne({
          where: { transactionId: dataJson['app_trans_id'] },
        });

        if (!order) {
          result.return_code = 0;
          result.return_message = 'Không tìm thấy đơn hàng';
          return result;
        }

        // Cập nhật trạng thái đơn hàng
        order.paymentStatus = 'đã thanh toán';
        order.paymentDate = new Date(); // Lưu ngày thanh toán
        await this.orderRepository.save(order);

        result.return_code = 1;
        result.return_message = 'Thanh toán thành công';
      } else {
        result.return_code = 0;
        result.return_message = 'Thanh toán thất bại';
      }
    } catch (error) {
      result.return_code = 0;
      result.return_message = error.message;
    }

    return result;
  }
  // thanh toán bằng vnpay
  // thanh toán bằng momo

  // xác nhận đơn hàng
  async confirmOrder(oid: number, state: string) {
    const order = await this.orderRepository.findOne({ where: { id: oid } });
    if (!order) {
      throw new HttpException(
        'Không tìm thấy đơn hàng',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Kiểm tra trạng thái hiện tại của đơn hàng
    if (order.orderConfirm) {
      throw new HttpException(
        'Đơn hàng đã được xác nhận trước đó',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (state === 'confirm') {
      order.orderConfirm = true;
      return await this.orderRepository.save(order);
    }
  }

  // chuyển trạng thái đơn hàng
  async orderStatus(oid: number, status: string) {
    const validStatuses = [
      'đang chờ',
      'đang giao hàng',
      'đã hoàn thành',
      'thất bại',
    ];
    if (!validStatuses.includes(status)) {
      throw new HttpException(
        'Trạng thái đơn hàng không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }
    const order = await this.orderRepository.findOne({ where: { id: oid } });
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND);
    }

    if (order.paymentStatus === 'đã hoàn thành') {
      throw new HttpException(
        'Đơn hàng đã hoàn tất, không thể thay đổi trạng thái',
        HttpStatus.BAD_REQUEST,
      );
    }

    order.paymentStatus = status;
    return this.orderRepository.save(order);
  }

  // lấy ra danh sách đơn hàng
  async getOrders(query: FilterOrderDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const [res, total] = await this.orderRepository.findAndCount({
      take: limit,
      skip,
      relations: [
        'cart',
        'cart.details',
        'cart.details.product',
        'cart.details.product.images',
      ],
      select: {
        id: true,
        orderCode: true,
        orderConfirm: true,
        paymentMethod: true,
        status: true,
        cart: {
          id: true,
          totalAmount: true,
          details: {
            size: true,
            color: true,
            price: true,
            sku: true,
            product: {
              id: true,
              slug: true,
              title: true,
              images: true,
            },
          },
        },
      },
    });

    return { data: res, total, page, limit };
  }

  // lấy ra chi tiết đơn hàng
  async getOrder(oid: number) {
    const order = await this.orderRepository.findOne({ where: { id: oid } });
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND);
    }

    return order;
  }
}
