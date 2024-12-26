import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { UpdateQuantityCartDto } from './dto/update-quantity-cart.dto';
import { Coupon } from 'src/coupon/entities/coupon.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartDetail)
    private readonly cartDetailRepository: Repository<CartDetail>,
    private readonly dataSource: DataSource, // Để dùng transaction
  ) {}

  async addToCart(
    userId: number,
    addToCartDto: AddToCartDto,
  ): Promise<{ message: string }> {
    const { productId, quantity, size, color, price, sku } = addToCartDto;

    // Kiểm tra dữ liệu đầu vào
    if (quantity <= 0 || price <= 0) {
      throw new Error('Quantity and price must be greater than 0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm giỏ hàng active của user
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { userId, isActive: true },
      });

      // Nếu chưa có giỏ hàng, tạo mới
      if (!cart) {
        cart = this.cartRepository.create({
          userId,
          isActive: true,
          totalAmount: 0,
        });
        cart = await queryRunner.manager.save(Cart, cart);
      }

      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
      let cartDetail = await queryRunner.manager.findOne(CartDetail, {
        where: { cartId: cart.id, productId, size, color },
      });

      if (cartDetail) {
        cartDetail.quantity += quantity;
        cartDetail.subtotal = cartDetail.price * cartDetail.quantity;
        await queryRunner.manager.save(CartDetail, cartDetail);
      } else {
        cartDetail = this.cartDetailRepository.create({
          productId,
          quantity,
          size,
          color,
          price,
          sku,
          cartId: cart.id,
          subtotal: price * quantity,
        });
        await queryRunner.manager.save(CartDetail, cartDetail);
      }

      // Tính toán lại tổng giá trị giỏ hàng
      cart.totalAmount = await this.calculateCartTotal(cart.id, queryRunner);

      await queryRunner.manager.save(Cart, cart);

      await queryRunner.commitTransaction();
      return { message: 'Thêm sản phẩm vào giỏ hàng thành công' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error while adding to cart:', error);
      throw new Error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateCartTotal(
    cartId: number,
    queryRunner,
  ): Promise<number> {
    const totalAmount = await queryRunner.manager
      .createQueryBuilder(CartDetail, 'cartDetail')
      .select('SUM(cartDetail.subtotal)', 'total')
      .where('cartDetail.cartId = :cartId', { cartId })
      .getRawOne();
    return totalAmount?.total || 0;
  }

  // lấy ra tất cả sản phẩm trong giỏ hàng
  async getAllCarts(userId: number) {
    const carts = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['details', 'details.product', 'details.product.images'],
      select: {
        id: true,
        totalAmount: true,
        details: {
          id: true,
          size: true,
          color: true,
          sku: true,
          price: true,
          quantity: true,
          product: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
    });
    return carts;
  }

  // cập nhật số lượng
  async updateQuantityCart(updateQuantityCart: UpdateQuantityCartDto) {
    const { quantity, cartDetailId } = updateQuantityCart;

    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
      throw new HttpException(
        'Số lượng phải lớn hơn 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra cartDetail có tồn tại không
    const existingCartDetail = await this.cartDetailRepository.findOne({
      where: { id: cartDetailId },
    });

    if (!existingCartDetail) {
      throw new HttpException(
        'Không tìm thấy sản phẩm trong giỏ hàng',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật số lượng và subtotal
    existingCartDetail.quantity = quantity;
    existingCartDetail.subtotal = existingCartDetail.price * quantity;
    await this.cartDetailRepository.save(existingCartDetail);

    // Tìm giỏ hàng liên quan và cập nhật lại totalAmount
    const cartId = existingCartDetail.cartId;
    const cartDetails = await this.cartDetailRepository.find({
      where: { cartId },
    });

    const totalAmount = cartDetails.reduce(
      (total, item) => total + item.subtotal,
      0,
    );
    await this.cartRepository.update(cartId, { totalAmount });

    return {
      message: 'Cập nhật số lượng thành công',
      cartDetailId,
      updatedQuantity: quantity,
      updatedSubtotal: existingCartDetail.subtotal,
      updatedTotalAmount: totalAmount,
    };
  }
  // xóa sản phẩm trong giỏ hàng
  async deleteProductInCart(cartDetailId: number) {
    // Kiểm tra cartDetail có tồn tại không
    const deleteResult = await this.cartDetailRepository.delete(cartDetailId);

    // Kiểm tra nếu không xóa được (do không tồn tại)
    if (deleteResult.affected === 0) {
      throw new HttpException(
        'Không tìm thấy sản phẩm trong giỏ hàng',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Trả về thông báo thành công
    return {
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      cartDetailId,
    };
  }

  // xóa tất cả sản phẩm trong giỏ hàng
  async deleteAllProductInCart(userId: number) {
    // Lấy giỏ hàng của người dùng đang active
    const cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['details'], // Lấy luôn danh sách chi tiết giỏ hàng
    });

    // Kiểm tra giỏ hàng có tồn tại không
    if (!cart || !cart.details.length) {
      throw new HttpException(
        'Giỏ hàng hiện tại không có sản phẩm nào',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Xóa tất cả sản phẩm trong giỏ hàng
    const deleteResult = await this.cartDetailRepository.delete({
      cartId: cart.id,
    });

    return {
      message: 'Xóa tất cả sản phẩm trong giỏ hàng thành công',
      deletedCount: deleteResult.affected, // Số sản phẩm đã xóa
    };
  }

  // áp dụng mã giảm giá vào giỏ hàng
  async applyCouponToCart(couponCode: string, cartId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm giỏ hàng
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: cartId },
        relations: ['details'],
        select: {
          id: true,
          details: {
            id: true,
            price: true,
            quantity: true,
          },
        },
      });

      if (!cart) {
        throw new HttpException(
          'Không tìm thấy giỏ hàng',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tìm mã giảm giá
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { couponCode, status: 'active' },
      });

      if (!coupon) {
        throw new HttpException(
          'Mã giảm giá không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (coupon.couponQuantity <= 0) {
        throw new HttpException(
          'Mã giảm giá đã hết lượt sử dụng',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tính tổng tiền giỏ hàng
      const totalAmount = cart.details.reduce((sum, item) => {
        return sum + item.quantity * Number(item.price);
      }, 0);

      if (Number(totalAmount) < coupon.minOrderValue) {
        throw new HttpException(
          `Đơn hàng cần đạt tối thiểu ${coupon.minOrderValue} để áp dụng mã giảm giá`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tính toán tổng tiền sau giảm giá
      const discountAmount = Math.min(
        Number(coupon.priceDiscount),
        Number(totalAmount),
      );
      const finalTotal = totalAmount - discountAmount;

      // Cập nhật mã giảm giá còn lại
      coupon.couponQuantity -= 1;
      await queryRunner.manager.save(coupon);

      // Cập nhật thông tin giỏ hàng
      cart.couponCode = couponCode;
      cart.discountAmount = discountAmount;
      cart.totalAmount = finalTotal;
      await queryRunner.manager.save(cart);

      // Commit transaction
      await queryRunner.commitTransaction();
      return {
        message: 'Áp dụng mã giảm giá vào giỏ hàng thành công',
        finalTotal,
        discountAmount,
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi xảy ra
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Kết thúc queryRunner
      await queryRunner.release();
    }
  }

  // Xóa mã giảm giá khỏi giỏ hàng
  async deleteCouponInCart(couponCode: string, cartId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm giỏ hàng
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: cartId, couponCode },
        select: {
          id: true,
          totalAmount: true,
          discountAmount: true,
          couponCode: true,
        },
      });

      if (!cart) {
        throw new HttpException(
          'Không tìm thấy giỏ hàng hoặc giỏ hàng không chứa mã giảm giá',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tìm mã giảm giá
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { couponCode, status: 'active' },
      });

      if (!coupon) {
        throw new HttpException(
          'Mã giảm giá không hợp lệ hoặc không còn hoạt động',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra giỏ hàng có áp dụng giảm giá hay không
      if (!cart.discountAmount || !cart.couponCode) {
        throw new HttpException(
          'Giỏ hàng không áp dụng mã giảm giá nào',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tính toán tổng tiền sau khi xóa giảm giá
      const finalTotal = cart.totalAmount + cart.discountAmount;

      // Cập nhật số lượng mã giảm giá còn lại
      coupon.couponQuantity += 1;
      await queryRunner.manager.save(coupon);

      // Cập nhật thông tin giỏ hàng
      cart.couponCode = null;
      cart.discountAmount = null;
      cart.totalAmount = finalTotal;
      await queryRunner.manager.save(cart);

      // Commit transaction
      await queryRunner.commitTransaction();
      return {
        message: 'Xóa mã giảm giá khỏi giỏ hàng thành công',
        finalTotal,
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi xảy ra
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Kết thúc queryRunner
      await queryRunner.release();
    }
  }
}
