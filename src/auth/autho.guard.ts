import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy các roleId được phép từ metadata
    const allowedRoleIds: number[] = this.reflector.get<number[]>(
      'allowedRoles',
      context.getHandler(),
    );

    // Nếu route không yêu cầu role cụ thể, cho phép truy cập
    if (!allowedRoleIds || allowedRoleIds.length === 0) {
      return true;
    }

    // Lấy thông tin user từ request (do middleware hoặc guard trước đó thêm vào)
    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    // Nếu không có user trong request, từ chối truy cập
    if (!user || !user.id) {
      throw new UnauthorizedException('Bạn cần đăng nhập để truy cập');
    }

    // Lấy thông tin user từ cơ sở dữ liệu
    const userDb = await this.userRepository.findOne({
      where: { id: user.id },
    });

    // Nếu user không tồn tại, từ chối truy cập
    if (!userDb) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Kiểm tra roleId của user có nằm trong danh sách allowedRoleIds không
    if (!allowedRoleIds.includes(userDb.roleId)) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này',
      );
    }

    return true;
  }
}
