import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity.js";

export enum RoomAccessByEnum {
  public = 'public',
  private = 'private',
  // TODO: only for autorized users
  // TODO: by password
}

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Column({ enum: RoomAccessByEnum, default: 'public' })
  public accessBy: RoomAccessByEnum;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: Relation<User>;
}
