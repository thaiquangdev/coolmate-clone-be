import { SetMetadata } from '@nestjs/common';

// allowedRoles sẽ chứa danh sách roleId được phép
export const Roles = (...roleIds: number[]) =>
  SetMetadata('allowedRoles', roleIds);
