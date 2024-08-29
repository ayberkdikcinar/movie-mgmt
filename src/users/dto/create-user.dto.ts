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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    maximum: 150,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({ enum: Role })
  @IsEnum(Role, {
    message: `Invalid role. Please choose a valid role. ${Object.values(
      Role,
    ).map((val) => '[' + val + ']')}`,
  })
  role: Role = Role.customer;
}
