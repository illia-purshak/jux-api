import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { JwtAuthGuard, OptionalJwtAuthGuard } from "@common/guards/jwt-auth.guard.js";
import { ConfigService } from "@nestjs/config";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AUTH_ERRORS } from "@modules/user/auth/auth.constants.js";
import { CONFIG } from "@common/config.js";

describe('JwtAuthGuard', () => {
  const jwtService = { verify: vi.fn() };
  const configService = { getOrThrow: vi.fn() };
  const secret = 'test-secret';
  let guard: JwtAuthGuard;

  const contextWith = (request: { headers: Record<string, string>; user?: unknown }) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
    configService.getOrThrow.mockReturnValue(secret);

    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('lets the user through and puts only sub on request.user', () => {
    jwtService.verify.mockReturnValue({ sub: 123, iat: 1, exp: 2 });
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer abc.def.ghi' },
    };

    expect(guard.canActivate(contextWith(request))).toBe(true);
    expect(request.user).toEqual({ sub: 123 });
    expect(configService.getOrThrow).toHaveBeenCalledWith(CONFIG.JWT_SECRET);
    expect(jwtService.verify).toHaveBeenCalledWith('abc.def.ghi', {
      secret,
      algorithms: ['HS256'],
    });
  });

  it.each([
    ['missing', {}],
    ['not Bearer', { authorization: 'Basic abc' }],
  ])('throws MISSING_TOKEN when the header is %s', (_, headers) => {
    expect(() => guard.canActivate(contextWith({ headers }))).toThrow(
      new UnauthorizedException(AUTH_ERRORS.MISSING_TOKEN),
    );
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it.each([
    ['token is invalid', new Error('jwt malformed')],
    ['token has wrong algoritm', new Error('invalid algorithm')],
    ['token is expired', new TokenExpiredError('jwt expired', new Date())],
  ])('throws INVALID_REFRESH_TOKEN when %s', (_, error) => {
    jwtService.verify.mockImplementation(() => {
      throw error;
    });
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer bad' },
    };

    expect(() => guard.canActivate(contextWith(request))).toThrow(
      new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN),
    );
    expect(request.user).toBeUndefined();
  });

  it('rejects a token signed with another secret', () => {
    const realJwt = new JwtService();
    const realGuard = new JwtAuthGuard(realJwt, configService as unknown as ConfigService);
    const foreignToken = realJwt.sign({ sub: 123 }, { secret: 'someone-elses-secret' });
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: `Bearer ${foreignToken}` },
    };

    expect(() => realGuard.canActivate(contextWith(request))).toThrow(UnauthorizedException);
    expect(request.user).toBeUndefined();

    const ownToken = realJwt.sign({ sub: 123 }, { secret });
    request.headers.authorization = `Bearer ${ownToken}`;
    expect(realGuard.canActivate(contextWith(request))).toBe(true);
  });

  it('every 401 has the same body without a reason', () => {
    const bodyOf = (headers: Record<string, string>, verifyError?: Error) => {
      jwtService.verify.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw verifyError;
      });
      try {
        guard.canActivate(contextWith({ headers }));
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        return (err as UnauthorizedException).getResponse();
      }
      throw new Error('guard did not throw');
    };

    const bodies = [
      bodyOf({}),
      bodyOf({ authorization: 'Basic abc' }),
      bodyOf({ authorization: 'Bearer bad' }, new Error('jwt malformed')),
      bodyOf({ authorization: 'Bearer bad' }, new Error('invalid algorithm')),
      bodyOf({ authorization: 'Bearer bad' }, new TokenExpiredError('jwt expired', new Date())),
    ];

    for (const body of bodies) {
      expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
    }
  });
});

describe('OptionalJwtAuthGuard', () => {
  const jwtService = { verify: vi.fn() };
  const configService = { getOrThrow: vi.fn().mockReturnValue('test-secret') };
  const guard = new OptionalJwtAuthGuard(
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
  );
  const contextWith = (request: { headers: Record<string, string>; user?: unknown }) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  beforeEach(() => vi.clearAllMocks());

  it('lets anonymous request through without user', () => {
    const request: { headers: Record<string, string>; user?: unknown } = { headers: {} };

    expect(guard.canActivate(contextWith(request))).toBe(true);
    expect(request.user).toBeUndefined();
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('still verifies a present token', () => {
    jwtService.verify.mockReturnValue({ sub: 7 });
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer abc' },
    };

    expect(guard.canActivate(contextWith(request))).toBe(true);
    expect(request.user).toEqual({ sub: 7 });

    jwtService.verify.mockImplementation(() => {
      throw new Error('bad');
    });
    expect(() => guard.canActivate(contextWith(request))).toThrow(UnauthorizedException);
  });
});
