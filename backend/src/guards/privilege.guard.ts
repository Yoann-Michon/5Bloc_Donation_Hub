import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PRIVILEGE_KEY } from '../decorators/require-privilege.decorator';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class PrivilegeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private badgesService: BadgesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPrivilege = this.reflector.getAllAndOverride<string>(
      PRIVILEGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPrivilege) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.walletAddress) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPrivilege = await this.badgesService.hasPrivilege(
      user.walletAddress,
      requiredPrivilege,
    );

    if (!hasPrivilege) {
      throw new ForbiddenException(
        `Privilege required: ${requiredPrivilege}`,
      );
    }

    return true;
  }
}
