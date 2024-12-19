/* eslint-disable @typescript-eslint/no-namespace */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
    return this.userService.getInfo(id);
  }
}
