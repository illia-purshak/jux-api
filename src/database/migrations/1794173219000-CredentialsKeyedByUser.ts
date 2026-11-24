import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CredentialsKeyedByUser1794173219000 implements MigrationInterface {
  name = 'CredentialsKeyedByUser1794173219000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP CONSTRAINT "PK_6b53030919e8e7d115def1601f1"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "REL_c7e5d44d955b1e057b7c1fd28c"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userCredentailsId"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "userId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD CONSTRAINT "PK_4f0dca1fea82790367331633fc8" PRIMARY KEY ("userId")`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "refreshExpiresAt" TIMESTAMP`);
    await queryRunner.query(`CREATE INDEX "IDX_339ba9e1b18f6e762a6a245ac0" ON "user_credentials"  ("refreshTokenHash") WHERE "refreshTokenHash" IS NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD CONSTRAINT "FK_07e09814aad35a2da5ef5a73e14" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP CONSTRAINT "FK_07e09814aad35a2da5ef5a73e14"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_339ba9e1b18f6e762a6a245ac0"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "refreshExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP CONSTRAINT "PK_4f0dca1fea82790367331633fc8"`);
    await queryRunner.query(`ALTER TABLE "user_credentials" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "userCredentailsId" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "REL_c7e5d44d955b1e057b7c1fd28c" UNIQUE ("userCredentailsId")`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD CONSTRAINT "PK_6b53030919e8e7d115def1601f1" PRIMARY KEY ("id")`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca" FOREIGN KEY ("userCredentailsId") REFERENCES "user_credentials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
