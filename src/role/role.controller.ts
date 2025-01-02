import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { UpdateRoleDto } from './dto/upadate-role.dto';
import { Authorize } from 'src/auth/autho.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnums } from 'src/helpers/enum';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo mới vai trò thành công' })
  @ApiResponse({ status: 401, description: 'Tạo mới vai trò thất bại' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Post('/create-role')
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<{ success: boolean; message: string; data: Role }> {
    const result = await this.roleService.createRole(createRoleDto);
    return {
      success: true,
      message: 'Tạo mới vai trò thành công',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Chỉnh sửa vai trò thành công' })
  @ApiResponse({ status: 401, description: 'Chỉnh sửa vai trò thất bại' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Put('update-role/:rid')
  async updateRole(
    @Param('rid') rid: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{ success: boolean; message: string; data: Role }> {
    const result = await this.roleService.updateRole(rid, updateRoleDto);
    return {
      success: true,
      message: 'Chỉnh sửa vai trò thành công',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Xóa vai trò thành công' })
  @ApiResponse({ status: 401, description: 'Xóa vai trò thất bại' })
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  @Delete('/delete-role/:rid')
  async deleteRole(
    @Param('rid') rid: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.roleService.deleteRole(rid);
    return {
      success: true,
      message: 'Xóa vai trò thành công',
    };
  }

  @ApiBearerAuth()
  @Get('get-roles')
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  async getRoles(): Promise<{ success: boolean; data: Role[] }> {
    const result = await this.roleService.getRoles();
    return {
      success: true,
      data: result,
    };
  }

  @ApiBearerAuth()
  @Get('get-role/:rid')
  @Roles(RoleEnums.Staff, RoleEnums.Admin)
  @UseGuards(AuthGuard, Authorize)
  async getRole(
    @Param('rid') rid: number,
  ): Promise<{ success: boolean; role: Role }> {
    const result = await this.roleService.getRole(rid);
    return {
      success: true,
      role: result,
    };
  }
}
