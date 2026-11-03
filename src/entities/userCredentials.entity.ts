import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity.js";

@Entity('user_credentails')
export class UserCredentails {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public passwordHash?: string;

  @Column({ nullable: true })
  public passUpdatedAt?: Date;

  @Column()
  public refreshToken: string;

  @Column()
  public accessToken: string;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @OneToOne(() => User, (user) => user.userCredentails)
  user: Relation<User>;
}
