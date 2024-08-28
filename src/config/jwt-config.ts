import { JwtModuleOptions } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants/jwtConstants';

export const jwtConfig: JwtModuleOptions = {
  global: true,
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '1d' },
};
