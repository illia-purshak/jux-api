import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersAndCredentials1793743327000 implements MigrationInterface {
  name = 'AddUsersAndCredentials1793743327000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_credentails" ("id" SERIAL NOT NULL, "passwordHash" character varying, "passUpdatedAt" TIMESTAMP, "refreshToken" character varying NOT NULL, "accessToken" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6b53030919e8e7d115def1601f1" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying, "email" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userCredentailsId" integer, CONSTRAINT "REL_c7e5d44d955b1e057b7c1fd28c" UNIQUE ("userCredentailsId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "room" ADD "userId" integer`);
    await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "accessBy" SET DEFAULT 'public'`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca" FOREIGN KEY ("userCredentailsId") REFERENCES "user_credentails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_0468c843ad48d3455e48d40ddd4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_0468c843ad48d3455e48d40ddd4"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7e5d44d955b1e057b7c1fd28ca"`);
    await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "accessBy" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "userId"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_credentails"`);
  }
}
