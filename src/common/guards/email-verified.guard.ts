import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class EmailVerifiedGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user?.emailVerifiedAt) {
      throw new ForbiddenException('Email verification required to perform this action.');
    }
    return true;
  }
}
