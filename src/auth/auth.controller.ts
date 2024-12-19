import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-otp.dto';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './utils/Guards';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-with-otp')
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi đăng ký' })
  @HttpCode(HttpStatus.CREATED) // Đặt mã trạng thái HTTP 201
  async registerWithOtp(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<{ success: boolean; result: User }> {
    const result = await this.authService.registerOtp(registerUserDto);
    return {
      success: true,
      result,
    };
  }

  @Post('verify-otp')
  @ApiResponse({ status: 201, description: 'Verify otp thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi verify otp' })
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyOTP(
    @Body() body: { email: string; otp: string },
  ): Promise<{ success: boolean; data: User }> {
    const data = await this.authService.verifyOtp(body.email, body.otp);
    return { success: true, data };
  }

  @Post('login')
  @ApiResponse({ status: 202, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi đăng nhập' })
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.ACCEPTED)
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.login(loginUserDto);
  }

  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Lỗi đăng nhập' })
  @UsePipes(ValidationPipe)
  @Post('login-staff')
  async loginStaff(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.loginStaff(loginUserDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshToken(
    @Body() refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request): Promise<User> {
    const { id } = req['user'];
    return await this.authService.logout(Number(id));
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {
    return {
      msg: 'Google Authentication',
    };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  loginGoogleCallBack() {
    return { msg: 'OK' };
  }
}
