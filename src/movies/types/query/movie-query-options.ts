import { QueryOptionsDto } from 'src/types/query-options.dto';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieQueryOptions extends QueryOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  sessions: number;
}
