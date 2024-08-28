import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class SigninUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
