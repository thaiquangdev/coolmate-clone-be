/* eslint-disable @typescript-eslint/no-namespace */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';
import { CreateUserDto } from './dto/create-user.dto';
import { Authorize } from 'src/auth/autho.guard';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('info')
  async getInfo(@Req() request: Request): Promise<User> {
    const { id } = request['user'];
    return this.userService.getInfo(Number(id));
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Admin, RoleEnums.Staff)
  @UseGuards(AuthGuard, Authorize)
  @Get('get-users')
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Admin, RoleEnums.Staff)
  @UseGuards(AuthGuard, Authorize)
  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUserByAdmin(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('change-profile')
  async changeProfile(
    @Req() req: Request,
    @Body() changeProfileDto: ChangeProfileDto,
  ): Promise<User> {
    const { id } = req['user'];
    return this.userService.changeProfile(Number(id), changeProfileDto);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Admin, RoleEnums.Staff)
  @UseGuards(AuthGuard, Authorize)
  @Put('change-password-by-admin')
  async changePasswordByAdmin(
    @Body()
    changePasswordDto: {
      userId: number;
      passwordData: ChangePasswordDto;
    },
  ) {
    const { userId, passwordData } = changePasswordDto;
    return this.userService.changePassword(userId, passwordData);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Admin, RoleEnums.Staff)
  @UseGuards(AuthGuard, Authorize)
  @Put('change-profile-by-admin')
  async changeProfileByAdmin(
    @Body() changeProfileDto: { userId: number; profileData: ChangeProfileDto },
  ) {
    const { userId, profileData } = changeProfileDto;
    return this.userService.changeProfile(userId, profileData);
  }

  @ApiBearerAuth()
  @Roles(RoleEnums.Admin, RoleEnums.Staff)
  @UseGuards(AuthGuard, Authorize)
  @Get('/get-user/:uid')
  async getUser(@Param('uid') uid: number) {
    return this.userService.getInfo(uid);
  }
}
