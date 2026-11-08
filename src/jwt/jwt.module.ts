import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from '@common/config.js';

type ExpiresIn = Extract<JwtSignOptions['expiresIn'], string>;

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.getOrThrow<ExpiresIn>(CONFIG.JWT_EXPIRATION_TIME);
        if (!/^\d+\s*(ms|s|m|h|d|w|y)$/i.test(expiresIn)) {
          throw new Error(`${CONFIG.JWT_EXPIRATION_TIME} must have a unit, e.g. 15m, 1h, 7d`);
        }

        const secret = configService.getOrThrow<string>(CONFIG.JWT_SECRET).trim();
        if (!secret) {
          throw new Error(`${CONFIG.JWT_SECRET} must not be empty`);
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class JwtSharedModule {}
