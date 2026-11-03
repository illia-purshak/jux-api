import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from "typeorm";
import { UserCredentails } from "./userCredentials.entity.js";
import { Room } from "./room.entity.js";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public name?: string;

  @Column({ nullable: true })
  public email?: string;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @OneToOne(() => UserCredentails, (credentials) => credentials.user, { cascade: true })
  @JoinColumn()
  userCredentails: Relation<UserCredentails>;

  @OneToMany(() => Room, (room) => room.user, { cascade: true })
  room: Relation<Room>;
}
