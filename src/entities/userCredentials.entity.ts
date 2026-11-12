import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, type Relation } from "typeorm";
import { User } from "./users.entity.js";
import { Exclude } from "class-transformer";

@Entity('user_credentails')
export class UserCredentails {
  @PrimaryColumn()
  public userId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true, length: 64, type: 'varchar', select: false })
  public passwordHash?: string;

  @Column({ nullable: true })
  public passUpdatedAt?: Date;

  @Exclude({ toPlainOnly: true })
  @Index({ where: '"refreshTokenHash" IS NOT NULL' })
  @Column({ nullable: true, type: 'varchar', select: false })
  public refreshTokenHash: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  public refreshExpiresAt: Date | null;

  @OneToOne(() => User, (user) => user.credentials)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
}
