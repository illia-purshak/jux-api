import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { DataSource } from "typeorm";
import { Room } from "@entities/room.entity.js";
import { createApp, expectNoSecrets, registerToken } from "./e2e.helpers.js";

describe("Room (e2e)", () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("without token -> 401", () => {
    it("POST /room", () => http().post("/api/v1/room").send({ name: "r", accessBy: "public" }).expect(401));
    it("PATCH /room/:id", () => http().patch("/api/v1/room/1").send({ name: "r" }).expect(401));
    it("DELETE /room/:id", () => http().delete("/api/v1/room/1").expect(401));
  });

  describe("someone else's room", () => {
    let roomId: number;
    let strangerToken: string;

    beforeEach(async () => {
      const ownerToken = await registerToken(app, "owner");
      strangerToken = await registerToken(app, "stranger");
      const room = await http()
        .post("/api/v1/room")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "owned", accessBy: "public" })
        .expect(201);
      roomId = room.body.id;
    });

    const roomInDb = () => app.get(DataSource).getRepository(Room).findOneBy({ id: roomId });

    it("PATCH is refused and the room is unchanged", async () => {
      const before = await roomInDb();
      await http()
        .patch(`/api/v1/room/${roomId}`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ name: "hacked" })
        .expect(404);
      expect(await roomInDb()).toEqual(before);
    });

    it("DELETE is refused and the room stays", async () => {
      const before = await roomInDb();
      await http().delete(`/api/v1/room/${roomId}`).set("Authorization", `Bearer ${strangerToken}`).expect(404);
      expect(await roomInDb()).toEqual(before);
    });
  });

  it("responses never contain passwordHash / refreshTokenHash", async () => {
    const token = await registerToken(app, "owner");
    const created = await http()
      .post("/api/v1/room")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "owned", accessBy: "public" })
      .expect(201);
    expectNoSecrets(created);

    expectNoSecrets(await http().get("/api/v1/room").expect(200));
    expectNoSecrets(await http().get(`/api/v1/room/${created.body.id}`).expect(200));
  });
});
