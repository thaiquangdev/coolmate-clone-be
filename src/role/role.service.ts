import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/upadate-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepositoty: Repository<Role>,
  ) {}

  // tạo mới một danh mục
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { roleName } = createRoleDto;
    const role = await this.roleRepositoty.findOneBy({ roleName });
    if (role) {
      throw new HttpException('Vai trò này đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newRole = await this.roleRepositoty.create({
      roleName,
    });

    return await this.roleRepositoty.save(newRole);
  }

  // chỉnh sửa vai trò
  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepositoty.findOneBy({ id });
    if (!role) {
      throw new HttpException('Không tìm thấy vai trò', HttpStatus.BAD_REQUEST);
    }

    role.roleName = updateRoleDto.roleName || role.roleName;
    role.status = updateRoleDto.status || role.status;

    return await this.roleRepositoty.save(role);
  }

  // lấy ra danh sách danh sách vai trò
  async getRoles(): Promise<Role[]> {
    const roles = await this.roleRepositoty.find();
    return roles;
  }

  // xóa một danh mục
  async deleteRole(id: number): Promise<DeleteResult> {
    const role = await this.roleRepositoty.findOneBy({ id });
    if (!role) {
      throw new HttpException('Không tìm thấy vai trò', HttpStatus.BAD_REQUEST);
    }

    return await this.roleRepositoty.delete(role);
  }
}
