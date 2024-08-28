import { Role } from 'src/users/types/enum/role';

export interface JWTUserPayload {
  id: string;
  username: string;
  role: Role;
  iat: number;
  exp: number;
}