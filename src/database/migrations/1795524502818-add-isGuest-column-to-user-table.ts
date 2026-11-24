import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsGuestColumnToUserTable1795524502818 implements MigrationInterface {
  name = 'AddIsGuestColumnToUserTable1795524502818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "isGuest" boolean GENERATED ALWAYS AS ("name" IS NULL AND "email" IS NULL) STORED NOT NULL`);
    await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["jux_api", "public", "user", "GENERATED_COLUMN", "isGuest", "\"name\" IS NULL AND \"email\" IS NULL"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "isGuest", "jux_api", "public", "user"]);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isGuest"`);
  }
}
