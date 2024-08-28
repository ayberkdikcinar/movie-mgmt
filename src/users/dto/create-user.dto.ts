import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Role } from '../types/enum/role';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @IsEnum(Role, {
    message: `Invalid role. Please choose a valid role. ${Object.values(
      Role,
    ).map((val) => '[' + val + ']')}`,
  })
  @IsOptional()
  role: Role = Role.customer;
}
