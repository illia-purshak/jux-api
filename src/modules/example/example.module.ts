/**
 * Sample feature module. For a new module, copy the `example` folder
 * and replace Example/example with your own name.
 *
 * To enable the module:
 *  1. configure `TypeOrmModule.forRoot(...)` in AppModule;
 *  2. add the module to AppModule `imports`.
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExampleEntity } from "@entities/example.entity.js";
import { ExampleController } from "./example.controller.js";
import { ExampleService } from "./example.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([ExampleEntity])],
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
