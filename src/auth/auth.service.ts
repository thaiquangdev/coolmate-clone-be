/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import MailService from 'src/mail/mail.service';
import { RegisterUserDto } from './dto/register-otp.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DetailsUserDto } from './dto/details-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerOtp(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, fullName, phoneNumber, password } = registerUserDto;

    // Kiểm tra email đã tồn tại chưa
    const emailExist = await this.userRepository.findOne({ where: { email } });
    if (emailExist) {
      throw new HttpException(
        'Email is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash mật khẩu
    const hashPassword = bcryptjs.hashSync(password, 10);

    // Tạo OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Tạo thực thể User
    const newUser = this.userRepository.create({
      email,
      fullName,
      phoneNumber,
      password: hashPassword,
      otp, // Gán OTP
    });

    // Lưu vào DB
    const savedUser = await this.userRepository.save(newUser);

    try {
      await this.mailService.sendOtp(email, otp);
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw new HttpException(
        'Failed to send OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return savedUser;
  }

  async verifyOtp(email: string, otp: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.otp !== otp) {
      throw new HttpException('Mã otp không đúng', HttpStatus.BAD_REQUEST);
    }

    user.emailVerify = true;
    user.otp = null;
    user.roleId = 3;
    return await this.userRepository.save(user);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });
    // kiểm tra xem email đã tồn tại chưa
    if (!user) {
      throw new HttpException(
        'Không tìm thấy email hoặc email chưa được đăng ký',
        HttpStatus.BAD_REQUEST,
      );
    }

    // so sánh mật khẩu
    const comparePassword = bcryptjs.compareSync(password, user.password);

    // nếu mật khẩu không đúng trả về lỗi
    if (!comparePassword) {
      throw new HttpException(
        'Email hoặc mật khẩu không đúng',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { id: String(user.id), email: String(user.email) };
    return this.generateToken(payload);
  }

  // đăng nhập quản trị viên và nhân viên
  async loginStaff(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });
    // kiểm tra xem email đã tồn tại chưa
    if (!user) {
      throw new HttpException(
        'Không tìm thấy email hoặc email chưa được đăng ký',
        HttpStatus.BAD_REQUEST,
      );
    }

    // so sánh mật khẩu
    const comparePassword = bcryptjs.compareSync(password, user.password);

    // nếu mật khẩu không đúng trả về lỗi
    if (!comparePassword) {
      throw new HttpException(
        'Email hoặc mật khẩu không đúng',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.roleId !== 1 && user.roleId !== 2) {
      throw new HttpException(
        'Bạn không có quyền đăng nhập',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { id: String(user.id), email: String(user.email) };
    return this.generateToken(payload);
  }

  // tạo mới lại token từ refresh token
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const verify = await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const checkExistToken = await this.userRepository.findOneBy({
        email: verify.email,
        refreshToken,
      });
      if (checkExistToken) {
        return this.generateToken({ id: verify.id, email: verify.email });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Refresk token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // đăng nhập với google
  async validateUser(
    details: DetailsUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, displayName, googleId } = details;

    // Kiểm tra xem user đã tồn tại chưa
    let user = await this.userRepository.findOneBy({ email });

    if (user) {
      if (user.accountType === 'local') {
        // Email đã được đăng ký với tài khoản thường
        throw new HttpException(
          'Email đã tồn tại, hãy dùng một tài khoản Google khác',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Nếu tài khoản Google đã tồn tại, tiếp tục xử lý đăng nhập
    } else {
      // Tạo tài khoản mới nếu không tồn tại
      user = this.userRepository.create({
        email,
        fullName: displayName,
        googleId,
        accountType: 'google',
        emailVerify: true,
        roleId: 3,
      });
      await this.userRepository.save(user);
    }

    // Tạo payload và trả về token
    const payload = { id: String(user.id), email: user.email };
    return this.generateToken(payload);
  }

  // đăng xuất
  async logout(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.refreshToken = null;
    return this.userRepository.save(user);
  }

  async findUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ googleId: id });
    return user;
  }

  private async generateToken(payload: {
    id: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN'),
    });

    await this.userRepository.update(
      { email: payload.email },
      {
        refreshToken,
      },
    );
    return { accessToken, refreshToken };
  }
}
