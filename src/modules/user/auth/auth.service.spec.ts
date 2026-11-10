import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { QueryFailedError, type DataSource, type EntityManager, type Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@entities/users.entity.js';
import type { UserCredentails } from '@entities/userCredentials.entity.js';
import { sha256 } from '@utils/hash.helper.js';
import { AuthService } from './auth.service.js';
import { AUTH_ERRORS, BCRYPT_SALT_ROUNDS } from './auth.constants.js';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  const jwtService = { sign: vi.fn() };
  const userRepository = { findOne: vi.fn() };
  const userCredRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockManager = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const dataSource = {
    transaction: vi.fn(
      async <T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> => {
        return callback(mockManager as unknown as EntityManager);
      },
    ),
  };

  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AuthService(
      jwtService as unknown as JwtService,
      userRepository as unknown as Repository<User>,
      userCredRepository as unknown as Repository<UserCredentails>,
      dataSource as unknown as DataSource,
    );
  });

  describe('login', () => {
    const dto = { identifier: 'john', password: 'secret' };
    const user = { id: 1, credentials: { passwordHash: 'hashed' } };

    it('returns tokens and saves refresh token hash when credentials are valid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('access-token');

      const result = await service.login(dto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: expect.any(String),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 });
      expect(userCredRepository.update).toHaveBeenCalledWith(
        { userId: 1 },
        {
          refreshTokenHash: expect.any(String),
          refreshExpiresAt: expect.any(Date),
        },
      );
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      userRepository.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toThrow(
        new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(userCredRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const dto = { name: 'john', email: 'example@mail.com', password: 'Sob132Ad' };
    const user = { id: 1 };
    const queryFailedErrorDuplicatedKey = new QueryFailedError('INSERT ...', [], Object.assign(new Error('duplicate key'), { code: '23505' }));
    const otherDbError = new QueryFailedError('INSERT ...', [], Object.assign(new Error('any error'), { code: '11111' }));

    it('returns tokens and saves refresh token hash after user registered', async () => {
      mockManager.findOne.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      mockManager.create.mockReturnValue(user);
      mockManager.save.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('access-token');

      const result = await service.register(dto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: expect.any(String),
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Sob132Ad', BCRYPT_SALT_ROUNDS);
      expect(mockManager.create).toHaveBeenCalledWith(User, {
        name: 'john',
        email: 'example@mail.com',
        credentials: { passwordHash: 'hashed' },
      });
      expect(mockManager.save).toHaveBeenCalledWith(User, user);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 });
      expect(userCredRepository.update).toHaveBeenCalledWith(
        { userId: 1 },
        {
          refreshTokenHash: expect.any(String),
          refreshExpiresAt: expect.any(Date),
        },
      );
    });

    it('throws ConflictException when such email or name already taken', async () => {
      mockManager.findOne.mockResolvedValue(user);

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException(AUTH_ERRORS.USER_EXISTS),
      );
      expect(mockManager.create).not.toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('throws ConflictException when DB unique constraint is violated', async () => {
      mockManager.findOne.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      mockManager.create.mockReturnValue(user);
      mockManager.save.mockRejectedValue(queryFailedErrorDuplicatedKey);

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException(AUTH_ERRORS.USER_EXISTS),
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('Sob132Ad', BCRYPT_SALT_ROUNDS);
      expect(mockManager.create).toHaveBeenCalledWith(User, {
        name: 'john',
        email: 'example@mail.com',
        credentials: { passwordHash: 'hashed' },
      });

      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(userCredRepository.update).not.toHaveBeenCalled();
    });

    it('rethrows other DB errors unchanged', async () => {
      mockManager.findOne.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      mockManager.create.mockReturnValue(user);
      mockManager.save.mockRejectedValue(otherDbError);

      await expect(service.register(dto)).rejects.toBe(
        otherDbError,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('Sob132Ad', BCRYPT_SALT_ROUNDS);
      expect(mockManager.create).toHaveBeenCalledWith(User, {
        name: 'john',
        email: 'example@mail.com',
        credentials: { passwordHash: 'hashed' },
      });

      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(userCredRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const dto = { refreshToken: 'old-refresh-token' };
    const user = { id: 'user-1' };

    it('returns new tokens and saves hash of the new refresh token', async () => {
      mockManager.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('access-token');

      const result = await service.refresh(dto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: expect.any(String),
      });
      expect(result.refreshToken).not.toBe(dto.refreshToken);
      expect(mockManager.findOne).toHaveBeenCalledWith(User, {
        where: {
          credentials: {
            refreshTokenHash: sha256(dto.refreshToken),
            refreshExpiresAt: expect.anything(),
          },
        },
        relations: { credentials: true },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1' });
      expect(userCredRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1' },
        {
          refreshTokenHash: sha256(result.refreshToken),
          refreshExpiresAt: expect.any(Date),
        },
      );
    });

    it('throws UnauthorizedException when refresh token is missing', async () => {
      await expect(service.refresh({ refreshToken: '' })).rejects.toThrow(
        new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when token is not found or expired', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.refresh(dto)).rejects.toThrow(
        new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN),
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(userCredRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const refreshToken = 'refresh-token';
    const credentials = {
      userId: 'user-1',
      refreshTokenHash: sha256(refreshToken),
      refreshExpiresAt: new Date(),
    };

    it('clears refresh token of the user', async () => {
      userCredRepository.findOne.mockResolvedValue(credentials);

      await service.logout(refreshToken);

      expect(userCredRepository.findOne).toHaveBeenCalledWith({
        where: { refreshTokenHash: sha256(refreshToken) },
      });
      expect(userCredRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1' },
        { refreshTokenHash: null, refreshExpiresAt: null },
      );
    });

    it('does nothing when refresh token is missing', async () => {
      await service.logout(undefined);

      expect(userCredRepository.findOne).not.toHaveBeenCalled();
      expect(userCredRepository.update).not.toHaveBeenCalled();
    });

    it('does nothing when token is not found', async () => {
      userCredRepository.findOne.mockResolvedValue(null);

      await service.logout(refreshToken);

      expect(userCredRepository.update).not.toHaveBeenCalled();
    });

    it('does nothing when token has no expiration date', async () => {
      userCredRepository.findOne.mockResolvedValue({ ...credentials, refreshExpiresAt: null });

      await service.logout(refreshToken);

      expect(userCredRepository.update).not.toHaveBeenCalled();
    });
  });
});
