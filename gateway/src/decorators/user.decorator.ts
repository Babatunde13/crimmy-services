import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthOwner = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const owner = request.owner;
    return data ? owner?.[data] : owner;
  },
);
