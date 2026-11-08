import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./users.entity.js";

@Entity('user_credentails')
export class UserCredentails {
  @PrimaryColumn()
  public userId: number;

  @Column({ nullable: true, length: 64, type: 'varchar' })
  public passwordHash?: string;

  @Column({ nullable: true })
  public passUpdatedAt?: Date;

  @Index({ where: '"refreshTokenHash" IS NOT NULL' })
  @Column({ nullable: true, type: 'varchar' })
  public refreshTokenHash: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  public refreshExpiresAt: Date | null;

  @OneToOne(() => User, (user) => user.credentials)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
}
