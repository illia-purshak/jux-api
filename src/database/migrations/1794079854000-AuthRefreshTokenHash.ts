import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRefreshTokenHash1794079854000 implements MigrationInterface {
  name = 'AuthRefreshTokenHash1794079854000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "refreshToken"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "accessToken"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "refreshTokenHash" character varying`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "passwordHash"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "passwordHash" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "passwordHash"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "passwordHash" character varying`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "refreshTokenHash"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "accessToken" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "refreshToken" character varying NOT NULL`);
  }
}
