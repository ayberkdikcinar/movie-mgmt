import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SigninUserDto } from './dto/signin.dto';
import { Role } from '../users/types/enum/role';
import { UserPayload } from '../users/payload/user-payload';

const createUserDto: CreateUserDto = {
  username: 'testusername',
  password: '12345678',
  age: 18,
  role: Role.manager,
};
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: {
            signup: jest
              .fn()
              .mockImplementation((user: CreateUserDto) =>
                Promise.resolve({ id: '1', ...user }),
              ),
            signin: jest.fn().mockImplementation(() =>
              Promise.resolve({
                access_token: 'testtokenaccess',
              }),
            ),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should return user payload when signup is successful', async () => {
    const userPayload: UserPayload = {
      id: '1',
      username: 'testusername',
      age: 18,
      role: Role.manager,
    };

    jest.spyOn(authService, 'signup').mockResolvedValueOnce(userPayload);

    const result = await authController.signup(createUserDto);

    expect(authService.signup).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(userPayload);
  });

  it('should return access_token when signin is successful', async () => {
    const signinUserDto: SigninUserDto = {
      username: 'testusername',
      password: '12345678',
    };

    /* jest.spyOn(authService, 'signin').mockResolvedValueOnce(userPayload); */

    const result = await authController.signin(signinUserDto);

    expect(authService.signin).toHaveBeenCalledWith(signinUserDto);
    expect(result).toHaveProperty('access_token');
  });

  it('should return wrong credentials when signin is failed', async () => {
    const signinUserDto: SigninUserDto = {
      username: 'testusername',
      password: '12345678',
    };

    const result = await authController.signin(signinUserDto);

    expect(authService.signin).toHaveBeenCalledWith(signinUserDto);
    expect(result).toHaveProperty('access_token');
  });
});
