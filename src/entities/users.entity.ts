import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from "typeorm";
import { UserCredentails } from "./userCredentials.entity.js";
import { Room } from "./room.entity.js";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, unique: true })
  public name?: string;

  @Column({ nullable: true, unique: true })
  public email?: string;

  @Column({
    type: 'boolean',
    asExpression: '"name" IS NULL AND "email" IS NULL',
    generatedType: 'STORED',
  })
  public readonly isGuest: boolean;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @OneToOne(() => UserCredentails, (credentials) => credentials.user, { cascade: true })
  credentials: Relation<UserCredentails>;

  @OneToMany(() => Room, (room) => room.user, { cascade: true })
  room: Relation<Room>;
}
