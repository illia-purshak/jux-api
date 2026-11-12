import { UserCredentails } from '@entities/userCredentials.entity.js';
import { User } from '@entities/users.entity.js';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, MoreThanOrEqual, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto, RefreshTokenDto, RegisterDto, TokenResponseDto } from './dto/index.js';
import { randomBytes } from 'crypto';
import { sha256 } from '@utils/hash.helper.js';
import { AUTH_ERRORS, BCRYPT_SALT_ROUNDS, REFRESH_TOKEN_TTL_MS } from './auth.constants.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCredentails)
    private readonly userCredRepository: Repository<UserCredentails>,

    private readonly dataSourse: DataSource,

  ) {}

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    return await this.dataSourse.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: [
        { name: identifier },
        { email: identifier.trim().toLowerCase() },
      ],
      relations: { credentials: true },
      select: {
        id: true,
        credentials: {
          passwordHash: true,
        },
      },
      });

      if (!user || !user.credentials || !user.credentials.passwordHash) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

      const validPassword = await bcrypt.compare(password, user.credentials.passwordHash);

      if (!validPassword) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

      return await this.generateAuthTokens({ manager, user });
    });
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    let user: User;

    try {
      user = await this.dataSourse.transaction(async (manager) => {
        const userExist = await manager.findOne(User, { where: [{ name }, { email }] });

        if (userExist) throw new ConflictException(AUTH_ERRORS.USER_EXISTS);

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const newUser = manager.create(User, {
          name,
          email,
          credentials: {
            passwordHash,
          } });

        return await manager.save(User, newUser);
      });
    } catch (err) {
      if (err instanceof QueryFailedError && (err.driverError as { code?: string })?.code === '23505') {
        throw new ConflictException(AUTH_ERRORS.USER_EXISTS);
      }
      throw err;
    }

    try {
      return await this.generateAuthTokens({ user });
    } catch (err) {
      throw new InternalServerErrorException(AUTH_ERRORS.REGISTERED_BUT_LOGIN_FAILED, { cause: err });
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    if (!dto.refreshToken) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    const refreshTokenHash = sha256(dto.refreshToken);

    return await this.dataSourse.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: {
          credentials: {
            refreshTokenHash: refreshTokenHash,
            refreshExpiresAt: MoreThanOrEqual(new Date()),
          },
        }, relations: { credentials: true },
      });

      if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

      try {
        return await this.generateAuthTokens({ manager, user, oldRefreshToken: refreshTokenHash });
      } catch (err) {
        if (err instanceof NotFoundException) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
        throw err;
      }
    });
  };

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    const refreshTokenHash = sha256(refreshToken);
    const token = await this.userCredRepository.findOne({
      where: { refreshTokenHash },
      select: {
        userId: true,
        refreshTokenHash: true,
        refreshExpiresAt: true,
      } });

    if (!token?.refreshTokenHash || !token.refreshExpiresAt) return;

    await this.userCredRepository.update(
      { userId: token.userId },
      {
        refreshTokenHash: null,
        refreshExpiresAt: null,
      },
    );
  };

  private async generateAuthTokens(
    { manager, user, oldRefreshToken }: { manager?: EntityManager; user: User; oldRefreshToken?: string },
  ): Promise<TokenResponseDto> {
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = sha256(refreshToken);

    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    const source = manager ?? this.dataSourse.manager;

    const queryBuilder = source.createQueryBuilder(UserCredentails, 'cred')
      .update(UserCredentails)
      .set({
        refreshTokenHash,
        refreshExpiresAt,
      })
      .where({ userId: user.id });

    if (oldRefreshToken !== undefined)
      queryBuilder.andWhere('"refreshTokenHash" = :oldRefreshToken', {
        oldRefreshToken,
      });

    const result = await queryBuilder.execute();

    if (result.affected !== 1)
      throw new NotFoundException(AUTH_ERRORS.CREDENTIALS_NOT_FOUND);

    return {
      accessToken,
      refreshToken,
    };
  }
}
