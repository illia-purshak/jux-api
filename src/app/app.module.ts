/**
 * Root module: global infrastructure (config, DB) and the list of feature modules.
 * Feature modules live in `src/modules/<name>` and are added to `imports`.
 */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { DatabaseModule } from "../database/database.module.js";
import { AuthModule } from "@modules/user/auth/auth.module.js";
import { RoomModule } from "@modules/room/room.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
