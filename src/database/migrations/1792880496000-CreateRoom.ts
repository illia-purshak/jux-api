import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoom1792880496000 implements MigrationInterface {
  name = 'CreateRoom1792880496000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "room" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "accessBy" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "room"`);
  }
}
