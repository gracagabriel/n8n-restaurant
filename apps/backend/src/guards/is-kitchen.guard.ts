import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsKitchenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return (
      user &&
      (user.role === 'KITCHEN' ||
        user.role === 'ADMIN' ||
        user.role === 'MANAGER')
    );
  }
}
