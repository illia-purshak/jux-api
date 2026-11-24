import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request, { Response } from "supertest";
import { App } from "supertest/types.js";
import { DataSource } from "typeorm";
import { AppModule } from "@app/app.module.js";
import { configureApp } from "@app/app.setup.js";
import { REFRESH_TOKEN_COOKIE } from "@modules/user/auth/auth.constants.js";

export const PASSWORD = "Passw0rdOk";

/** Fresh app per test (also resets the in-memory throttler) on an emptied test DB. */
export async function createApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = configureApp(moduleFixture.createNestApplication<INestApplication<App>>());
  await app.init();
  await app.get(DataSource).query(`TRUNCATE "room", "user_credentails", "user" RESTART IDENTITY CASCADE`);
  return app;
}

export function refreshCookie(res: Response): string {
  const setCookie = res.get("Set-Cookie") ?? [];
  const cookie = setCookie.find((c) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
  if (!cookie) throw new Error(`No ${REFRESH_TOKEN_COOKIE} cookie in response`);
  return cookie.split(";")[0];
}

export function register(app: INestApplication<App>, name: string, email = `${name}@test.dev`) {
  return request(app.getHttpServer()).post("/api/v1/auth/register").send({ name, email, password: PASSWORD });
}

export async function registerToken(app: INestApplication<App>, name: string): Promise<string> {
  const res = await register(app, name).expect(201);
  return res.body.accessToken as string;
}

export function expectNoSecrets(res: Response): void {
  expect(res.text).not.toContain("passwordHash");
  expect(res.text).not.toContain("refreshTokenHash");
}
