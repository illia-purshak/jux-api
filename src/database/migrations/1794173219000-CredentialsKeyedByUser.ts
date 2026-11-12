import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CredentialsKeyedByUser1794173219000 implements MigrationInterface {
  name = 'CredentialsKeyedByUser1794173219000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP CONSTRAINT "PK_6b53030919e8e7d115def1601f1"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "REL_c7e5d44d955b1e057b7c1fd28c"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userCredentailsId"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD "userId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD CONSTRAINT "PK_4f0dca1fea82790367331633fc8" PRIMARY KEY ("userId")`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD "refreshExpiresAt" TIMESTAMP`);
    await queryRunner.query(`CREATE INDEX "IDX_f74dbca34e7826007b2b12cc71" ON "user_credentails"  ("refreshTokenHash") WHERE "refreshTokenHash" IS NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD CONSTRAINT "FK_4f0dca1fea82790367331633fc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP CONSTRAINT "FK_4f0dca1fea82790367331633fc8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f74dbca34e7826007b2b12cc71"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP COLUMN "refreshExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP CONSTRAINT "PK_4f0dca1fea82790367331633fc8"`);
    await queryRunner.query(`ALTER TABLE "user_credentails" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "userCredentailsId" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "REL_c7e5d44d955b1e057b7c1fd28c" UNIQUE ("userCredentailsId")`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_credentails" ADD CONSTRAINT "PK_6b53030919e8e7d115def1601f1" PRIMARY KEY ("id")`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca" FOREIGN KEY ("userCredentailsId") REFERENCES "user_credentails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
