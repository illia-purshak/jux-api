/**
 * Root controller: `GET /api/v1` — a simple liveness check.
 * Replace or remove it once real modules exist.
 */

import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
