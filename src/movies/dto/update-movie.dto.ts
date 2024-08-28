import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  ageRestriction: number;
}
