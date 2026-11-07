import { Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('register')
  async register(dto: LoginDto) {
    return await this.authService.register(dto);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) resp: Response) {
    resp.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return { message: 'Logout successful' };
  }
}
