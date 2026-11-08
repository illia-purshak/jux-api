import { UserCredentails } from '@entities/userCredentials.entity.js';
import { User } from '@entities/users.entity.js';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, QueryFailedError, Repository } from 'typeorm';
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

    const user = await this.userRepository.findOne({ where: [
      { name: identifier },
      { email: identifier.trim().toLowerCase() },
    ], relations: { credentials: true },
    });

    if (!user || !user.credentials || !user.credentials.passwordHash) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

    const validPassword = await bcrypt.compare(password, user.credentials.passwordHash);

    if (!validPassword) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

    const { refreshToken, accessToken } = await this.generateAuthTokens(user);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    try {
      const user = await this.dataSourse.transaction(async (manager) => {
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

      const { refreshToken, accessToken } = await this.generateAuthTokens(user);

      return { refreshToken, accessToken };
    } catch (err) {
      if (err instanceof QueryFailedError && (err.driverError as { code?: string })?.code === '23505') {
        throw new ConflictException(AUTH_ERRORS.USER_EXISTS);
      }
      throw err;
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    if (!dto.refreshToken) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    const token = sha256(dto.refreshToken);

    const record = await this.userRepository.findOne({ where: {
      credentials: {
        refreshTokenHash: token,
        refreshExpiresAt: MoreThanOrEqual(new Date()),
      },

    }, relations: { credentials: true } });

    if (!record) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    const { accessToken, refreshToken } = await this.generateAuthTokens(record);

    return { accessToken, refreshToken };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    const refreshTokenHash = sha256(refreshToken);
    const token = await this.userCredRepository.findOne({ where: { refreshTokenHash } });

    if (!token?.refreshTokenHash || !token.refreshExpiresAt) return;

    await this.userCredRepository.update(
      { userId: token.userId },
      {
        refreshTokenHash: null,
        refreshExpiresAt: null,
      },
    );
  };

  private async generateAuthTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = sha256(refreshToken);

    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    await this.userCredRepository.update(
      { userId: user.id },
      {
        refreshTokenHash,
        refreshExpiresAt,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
