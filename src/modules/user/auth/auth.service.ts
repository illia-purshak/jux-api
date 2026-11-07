import { UserCredentails } from '@entities/userCredentials.entity.js';
import { User } from '@entities/users.entity.js';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/login.dto.js';
import { hash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCredentails)
    private readonly userCredRepository: Repository<UserCredentails>,

  ) {}

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    const user = await this.userRepository.findOne({ where: [
      { name: identifier },
      { email: identifier },
    ], relations: { userCredentails: true },
    });

    if (!user || !user.userCredentails || !user.userCredentails.passwordHash) throw new UnauthorizedException(); // TODO: Add exception text

    const validPassword = await bcrypt.compare(password, user.userCredentails.passwordHash);

    if (!validPassword) throw new UnauthorizedException(); // TODO: Add exception text

    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = hash('sha256', refreshToken);

    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1h') } as JwtSignOptions,
    );

    const savedToken = this.userRepository.merge(user, { userCredentails: { refreshTokenHash } });
    await this.userRepository.save(savedToken);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const user = await this.userRepository.findOne({ where: { name, email } });

    if (user) throw new ConflictException(); // TODO: Add exception text

    // TODO: move salt round into env or const
    const passwordHash = await bcrypt.hash(password, 10);
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = hash('sha256', refreshToken);

    const registered = this.userRepository.create({
      name,
      email,
      userCredentails: {
        passwordHash,
        refreshTokenHash,
      } });

    await this.userRepository.save(registered);

    const accessToken = this.jwtService.sign(
      { id: registered.id },
      { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1h') } as JwtSignOptions,
    );

    return { refreshToken, accessToken };
  }
}
