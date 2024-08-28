import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  //maybe put some options like 18, 7, 15, 12?
  @IsInt()
  ageRestriction: number;
}
