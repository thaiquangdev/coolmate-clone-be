import { IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  roleName: string;

  @IsString()
  status: string;
}
