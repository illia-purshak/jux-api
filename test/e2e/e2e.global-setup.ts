/// <reference types="vite/client" />
import { Client } from "pg";
import { DataSource, type MigrationInterface } from "typeorm";

export default async function setup() {
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE } = process.env;
  const connection = {
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  };

  const admin = new Client({ ...connection, database: "postgres" });
  await admin.connect();
  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [POSTGRES_DATABASE]);
  if (!rowCount) await admin.query(`CREATE DATABASE "${POSTGRES_DATABASE}"`);
  await admin.end();

  const migrations = Object.values(
    import.meta.glob<Record<string, new () => MigrationInterface>>("../../src/database/migrations/*.ts", { eager: true }),
  ).flatMap((module) => Object.values(module));

  const dataSource = new DataSource({
    type: "postgres",
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    migrations,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
