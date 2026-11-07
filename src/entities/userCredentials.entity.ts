import { Column, Entity, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity.js";

@Entity('user_credentails')
export class UserCredentails {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, length: 64, type: 'varchar' })
  public passwordHash?: string;

  @Column({ nullable: true })
  public passUpdatedAt?: Date;

  @Column({ nullable: true })
  public refreshTokenHash?: string;

  @OneToOne(() => User, (user) => user.userCredentails)
  user: Relation<User>;
}
