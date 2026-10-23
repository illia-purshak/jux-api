/**
 * Global HTTP setup shared by `main.ts` and e2e tests, so tests run against
 * the same prefix, CORS, validation and serialization as production.
 */

import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  API_PREFIX,
  CORS_ALLOWED_HEADERS,
  CORS_METHODS,
} from "@constants/app.constants.js";

export function configureApp<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    // `CORS_ORIGIN=http://a.com, http://b.com` → ["http://a.com", "http://b.com"]; unset → any origin.
    origin: parseList(process.env.CORS_ORIGIN) ?? "*",
    methods: CORS_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Respects @Exclude()/@Expose() from class-transformer on returned entities/DTOs.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // Lets TypeORM close DB connections gracefully on SIGTERM/SIGINT.
  app.enableShutdownHooks();
  return app;
}

function parseList(value?: string): string[] | undefined {
  const items = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items?.length ? items : undefined;
}
