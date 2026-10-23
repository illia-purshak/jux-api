/**
 * Root service backing AppController. Keep app-wide logic out of here:
 * put it into a feature module under `src/modules`.
 */

import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
