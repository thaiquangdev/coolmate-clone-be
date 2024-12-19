import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';
import * as bcryptjs from 'bcryptjs';
import { ChangeProfileDto } from './dto/change-profile.dto';
import crypto from 'crypto';
import MailService from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  // lấy ra thông tin người dùng
  async getInfo(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: Number(userId) });
    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  // thay đổi mật khẩu
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const { oldPassword, newPassword } = changePasswordDto;
    // kiểm tra xem người dùng có tồn tại không
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        `Không tìm thấy người dùng với id ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // so sánh mật khẩu cũ có trùng không
    const comparePassword = await bcryptjs.compare(oldPassword, user.password);
    if (!comparePassword) {
      throw new HttpException('Mật khẩu cũ không đúng', HttpStatus.BAD_REQUEST);
    }

    // hash mật khẩu mới
    const hashPasswod = await bcryptjs.hash(newPassword, 10);
    user.password = hashPasswod;
    return await this.userRepository.save(user);
  }

  // thay đổi thông tin người dùng
  async changeProfile(
    userId: number,
    changeProfileDto: ChangeProfileDto,
  ): Promise<User> {
    const { phoneNumber, fullName, email } = changeProfileDto;
    // kiểm tra user có tồn tại không
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        `Không tìm thấy người dùng với id ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // nếu có email, kiểm tra email đã tồn tại chưa. Nếu tồn tại báo lỗi
    if (email) {
      const emailExist = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExist) {
        throw new HttpException(
          `Email ${email} đã tồn tại`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // nếu có số điện thoại, kiểm tra số điện thoại đã tồn tại chưa. Nếu tồn tại báo lỗi
    if (phoneNumber) {
      const phoneNumberExist = await this.userRepository.findOne({
        where: { phoneNumber },
      });
      if (phoneNumberExist) {
        throw new HttpException(
          `Số điện thoại ${phoneNumber} đã tồn tại`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    return await this.userRepository.save(user);
  }

  // Quên mật khẩu
  async forgotPassword(email: string) {
    // Kiểm tra email có tồn tại không
    const emailExist = await this.userRepository.findOne({ where: { email } });
    if (!emailExist) {
      throw new HttpException(
        'Email này không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tạo token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpire = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 ngày trong miligiây

    // Cập nhật token và tokenExpire vào DB
    emailExist.passwordResetToken = token;
    emailExist.passwordResetExpiry = tokenExpire;

    // Lưu lại đối tượng đã được cập nhật
    await this.userRepository.save(emailExist);

    // Gửi mail kèm token
    try {
      await this.mailService.sendMailForgotPassword(email, token);
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw new HttpException(
        'Failed to send Forgot password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message:
        'Một email đã được gửi đến bạn với hướng dẫn khôi phục mật khẩu.',
    };
  }

  // reset mật khẩu
  async resetPassword(token: string, newPassword: string) {
    // kiểm tra xem token hợp lệ không
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });
    if (!user) {
      throw new HttpException(
        'Token không hợp lệ hoặc đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }

    // kiểm tra xem token đã hết hạn chưa
    if (new Date() > user.passwordResetExpiry) {
      throw new HttpException('Token đã hết hạn', HttpStatus.BAD_REQUEST);
    }

    // băm mật khẩu mới
    const hashPassword = await bcryptjs.hash(newPassword, 10);

    // cập nhật mật khẩu mới
    user.password = hashPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;

    // lưu lại người dùng khi đã cập nhật mật khẩu
    await this.userRepository.save(user);
    return { messag: 'Mật khẩu đã được cập nhật thành công' };
  }
}
