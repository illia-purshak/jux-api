/**
 * Root module: global infrastructure (config, DB) and the list of feature modules.
 * Feature modules live in `src/modules/<name>` and are added to `imports`.
 */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [
    // Loads `.env` into process.env and provides ConfigService everywhere.
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
