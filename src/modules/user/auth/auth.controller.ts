import { Body, Controller, Cookies, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AccessTokenDto, LoginDto, RegisterDto } from './dto/index.js';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_TTL_MS } from './auth.constants.js';
import type { Response } from 'express';
import { CurrentUserId } from '@common/decorators/current-user.decorator.js';
import { SkipThrottle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '@common/guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('guest')
  async guest(
    @Res({ passthrough: true }) resp: Response,
    @CurrentUserId({ allowUndefined: true }) id?: number,
  ): Promise<AccessTokenDto> {
    const { refreshToken: newRefresh, accessToken } = await this.authService.guest(id);

    this.setCookie(resp, newRefresh);

    return { accessToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken: newRefresh, accessToken } = await this.authService.login(dto);

    this.setCookie(resp, newRefresh);
    return { accessToken };
  }

  @SkipThrottle()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken: newRefresh, accessToken } = await this.authService.register(dto);

    this.setCookie(resp, newRefresh);
    return { accessToken };
  }

  @Get('refresh')
  async refresh(
    @Cookies(REFRESH_TOKEN_COOKIE) refreshToken: string,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<AccessTokenDto> {
    const { refreshToken: newRefresh, accessToken } = await this.authService.refresh({ refreshToken });

    this.setCookie(resp, newRefresh);
    return { accessToken };
  }

  @SkipThrottle()
  @Get('logout')
  async logout(
    @Res({ passthrough: true }) resp: Response,
    @Cookies(REFRESH_TOKEN_COOKIE) refreshToken: string,
  ) {
    resp.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS);

    await this.authService.logout(refreshToken);

    return { message: 'Logout successful' };
  }

  private setCookie(resp: Response, newRefresh: string) {
    resp.cookie(REFRESH_TOKEN_COOKIE, newRefresh, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }
}
