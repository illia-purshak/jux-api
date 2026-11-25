import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CONFIG } from "@common/config.js";
import { JwtPayloadDto } from "../../jwt/jwt.dto.js";
import { AUTH_ERRORS } from "@modules/user/auth/auth.constants.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(AUTH_ERRORS.MISSING_TOKEN);
    }

    const token = authHeader.slice(7);
    let payload: JwtPayloadDto;

    try {
      payload = this.jwtService.verify<JwtPayloadDto>(token, {
        secret: this.configService.getOrThrow<string>(CONFIG.JWT_SECRET),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    const user: JwtPayloadDto = {
      sub: payload.sub,
    };
    request.user = user;
    return true;
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.headers['authorization'] === undefined) return true;
    return super.canActivate(context);
  }
}
