import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ enum: RoomAccessByEnum })
  public accessBy: RoomAccessByEnum;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;
}
