import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "@app/app.module.js";
import { configureApp } from "@app/app.setup.js";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Same global setup as main.ts (prefix, validation, serialization).
    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
  });

  it("/api/v1 (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1")
      .expect(200)
      .expect("Hello World!");
  });

  afterEach(async () => {
    await app.close();
  });
});
