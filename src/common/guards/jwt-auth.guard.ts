import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CONFIG } from "@common/config.js";
import { JwtPayloadDto } from "../../jwt/jwt.dto.js";

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
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    const token = authHeader.slice(7);
    let payload: JwtPayloadDto;

    try {
      payload = this.jwtService.verify<JwtPayloadDto>(token, {
        secret: this.configService.getOrThrow<string>(CONFIG.JWT_SECRET),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const user: JwtPayloadDto = {
      sub: payload.sub,
    };
    request.user = user;
    return true;
  }
}
