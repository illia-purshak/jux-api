import { Body, Controller, Cookies, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AccessTokenDto, LoginDto, RegisterDto } from './dto/index.js';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_TTL_MS } from './auth.constants.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken, accessToken } = await this.authService.login(dto);

    resp.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return { accessToken };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken, accessToken } = await this.authService.register(dto);

    resp.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return { accessToken };
  }

  @Get('refresh')
  async refresh(
    @Cookies(REFRESH_TOKEN_COOKIE) refreshToken: string,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken: newRefresh, accessToken } = await this.authService.refresh({ refreshToken });

    resp.cookie(REFRESH_TOKEN_COOKIE, newRefresh, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return { accessToken };
  }

  @Get('logout')
  async logout(
    @Res({ passthrough: true }) resp: Response,
    @Cookies(REFRESH_TOKEN_COOKIE) refreshToken: string,
  ) {
    resp.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS);

    await this.authService.logout(refreshToken);

    return { message: 'Logout successful' };
  }
}
