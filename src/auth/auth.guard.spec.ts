import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let mockRequest: any;
  let context: ExecutionContext;

  beforeAll(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    reflector = { getAllAndOverride: jest.fn() } as any;
    authGuard = new AuthGuard(jwtService, reflector);
  });

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
  });

  describe('canActivate', () => {
    it('should attach user to request if token is valid', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';

      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: 'user-id',
        username: 'username',
        role: 'user-role',
        iat: 123,
        exp: 456,
      });

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual({
        id: 'user-id',
        username: 'username',
        role: 'user-role',
        iat: 123,
        exp: 456,
      });
    });

    it('should return true for public routes', async () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';

      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
