import { IsInt, Min, IsOptional, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const DEFAULT_PAGE_SIZE = 100;

export class QueryOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 500,
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  readonly pageSize: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.pageSize || DEFAULT_PAGE_SIZE);
  }
}
