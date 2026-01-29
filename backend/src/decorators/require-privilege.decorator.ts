import { SetMetadata } from '@nestjs/common';
import { PrivilegeType } from '@prisma/client';

export const PRIVILEGE_KEY = 'required_privilege';
export const RequirePrivilege = (privilege: PrivilegeType) =>
  SetMetadata(PRIVILEGE_KEY, privilege);
