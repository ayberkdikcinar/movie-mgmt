import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '../users/types/enum/role';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let context: ExecutionContext;
  let mockUser: { role: Role };

  beforeAll(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    rolesGuard = new RolesGuard(reflector);
  });

  beforeEach(() => {
    mockUser = { role: Role.manager };

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;
  });

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    const result = rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([Role.manager]);

    const result = rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false if user does not have any of the required roles', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([Role.manager]);
    mockUser.role = Role.customer;
    const result = rolesGuard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return false if user role is undefined', () => {
    mockUser.role = undefined;
    reflector.getAllAndOverride = jest.fn().mockReturnValue([Role.customer]);

    const result = rolesGuard.canActivate(context);

    expect(result).toBe(false);
  });
});
