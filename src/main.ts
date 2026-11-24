/**
 * Entry point: loads `.env`, applies the global HTTP setup (`configureApp`),
 * mounts Swagger (development only by default) and starts the HTTP server.
 */

import { Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@app/app.module.js";
import { configureApp } from "@app/app.setup.js";
import {
  API_PREFIX,
  DEFAULT_PORT,
  SWAGGER_PATH,
} from "@constants/app.constants.js";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await ConfigModule.envVariablesLoaded;
  configureApp(app);
  const logger = new Logger("Bootstrap");

  const swaggerEnabled = process.env.SWAGGER_ENABLED
    ? process.env.SWAGGER_ENABLED === "true"
    : process.env.NODE_ENV === "development";
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(process.env.npm_package_name ?? "API")
      .setVersion(process.env.npm_package_version ?? "0.0.0")
      .addBearerAuth()
      .build();
    SwaggerModule.setup(SWAGGER_PATH, app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  app.set('trust proxy', 'loopback');

  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Application is running on ${url}/${API_PREFIX}`);
  if (swaggerEnabled) logger.log(`Swagger UI: ${url}/${SWAGGER_PATH}`);
}
await bootstrap();
