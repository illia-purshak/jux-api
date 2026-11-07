import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG_DATABASE } from './config.js';

interface PoolOptions {
  max?: number;
  connectionTimeoutMillis?: number;
}

const poolOptions = (configService: ConfigService): PoolOptions => {
  const options: PoolOptions = {};
  const max = Number(configService.get(CONFIG_DATABASE.POSTGRES_POOL_MAX));
  if (Number.isInteger(max) && max > 0) options.max = max;
  const timeout = Number(configService.get(CONFIG_DATABASE.POSTGRES_POOL_CONNECTION_TIMEOUT_MS));
  if (Number.isInteger(timeout) && timeout > 0) options.connectionTimeoutMillis = timeout;
  return options;
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get(CONFIG_DATABASE.POSTGRES_HOST),
        port: configService.get(CONFIG_DATABASE.POSTGRES_PORT),
        username: configService.get(CONFIG_DATABASE.POSTGRES_USER),
        password: configService.get(CONFIG_DATABASE.POSTGRES_PASSWORD),
        database: configService.get(CONFIG_DATABASE.POSTGRES_DB),
        autoLoadEntities: true,
        synchronize: false,
        extra: poolOptions(configService),
      }),
    }),
  ],
})
export class DatabaseModule {}
