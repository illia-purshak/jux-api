/**
 * TypeORM entities (DB tables).
 *
 * Rules for this folder:
 *  - one file = one entity, named `<name>.entity.ts`, class `<Name>Entity`;
 *  - schema only: columns, indexes, relations (@ManyToOne, @OneToMany ...);
 *    business logic lives in module services, input validation — in DTOs;
 *  - set the table name explicitly, in plural: `@Entity('examples')`;
 *  - register the entity in a module via `TypeOrmModule.forFeature([ExampleEntity])`.
 *
 * This file is a sample. Copy it, rename it and remove the fields you don't need.
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("examples")
export class ExampleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
