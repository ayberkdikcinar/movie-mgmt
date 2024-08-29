import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    maximum: 18,
    minimum: 7,
  })
  @IsInt()
  @Min(7)
  @Max(18)
  ageRestriction: number;
}
