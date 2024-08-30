import { QueryOptionsDto } from 'src/types/query-options.dto';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovieQueryOptions extends QueryOptionsDto {
  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    maximum: 1,
    description: 'Movies with sessions populated. 0 or 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  sessions: number;
}
