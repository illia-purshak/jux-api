import { UserCredSubscriber } from "@common/decorators/subscriber/password-change.subscriber.js";
import { UserCredentails } from "@entities/userCredentials.entity.js";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: true,
  logging: false,
  entities: [UserCredentails],
  subscribers: [UserCredSubscriber],
  migrations: [],
});
