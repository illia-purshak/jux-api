import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { createApp, expectNoSecrets, PASSWORD, refreshCookie, register } from "./e2e.helpers.js";

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("full cycle: register -> login -> refresh -> logout", async () => {
    const registered = await register(app, "alice").expect(201);
    expect(registered.body.accessToken).toEqual(expect.any(String));
    expectNoSecrets(registered);

    const login = await http()
      .post("/api/v1/auth/login")
      .send({ identifier: "alice@test.dev", password: PASSWORD })
      .expect(201);
    expect(login.body.accessToken).toEqual(expect.any(String));
    expectNoSecrets(login);

    const refreshed = await http().get("/api/v1/auth/refresh").set("Cookie", refreshCookie(login)).expect(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));

    await http().get("/api/v1/auth/logout").set("Cookie", refreshCookie(refreshed)).expect(200);
  });

  it("old refresh token after rotation -> 401", async () => {
    const oldCookie = refreshCookie(await register(app, "alice").expect(201));

    await http().get("/api/v1/auth/refresh").set("Cookie", oldCookie).expect(200);
    await http().get("/api/v1/auth/refresh").set("Cookie", oldCookie).expect(401);
  });

  it("refresh after logout -> 401, repeated logout does not fail", async () => {
    const cookie = refreshCookie(await register(app, "alice").expect(201));

    await http().get("/api/v1/auth/logout").set("Cookie", cookie).expect(200);
    await http().get("/api/v1/auth/refresh").set("Cookie", cookie).expect(401);
    await http().get("/api/v1/auth/logout").set("Cookie", cookie).expect(200);
  });

  it("register with a taken email -> 409", async () => {
    await register(app, "alice", "same@test.dev").expect(201);
    await register(app, "bob", "same@test.dev").expect(409);
  });

  it("wrong password and unknown email give the same 401", async () => {
    await register(app, "alice").expect(201);

    const wrongPassword = await http()
      .post("/api/v1/auth/login")
      .send({ identifier: "alice@test.dev", password: "WrongPass1" })
      .expect(401);
    const unknownEmail = await http()
      .post("/api/v1/auth/login")
      .send({ identifier: "nobody@test.dev", password: PASSWORD })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it("guest is rate limited: 11th request in a minute -> 429", async () => {
    for (let i = 0; i < 10; i++) {
      await http().post("/api/v1/auth/guest").expect(201);
    }

    await http().post("/api/v1/auth/guest").expect(429);
  });
});
