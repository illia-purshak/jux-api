import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtPayloadDto } from "../../jwt/jwt.dto.js";

interface CurrentUserIdOptions {
  allowUndefined?: boolean;
}

export const CurrentUserId = createParamDecorator((
  options: CurrentUserIdOptions | undefined,
  context: ExecutionContext,
): number | undefined => {
  const request = context.switchToHttp().getRequest<{ user?: JwtPayloadDto }>();

  const userId = request.user?.sub;

  if (userId === undefined && !options?.allowUndefined)
    throw new UnauthorizedException();

  return userId;
},
);
