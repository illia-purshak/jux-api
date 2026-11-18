import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayloadDto } from "../../jwt/jwt.dto.js";

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<{ user: JwtPayloadDto }>();
    return request.user.sub;
  },
);
