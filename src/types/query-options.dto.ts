import { IsInt, Min, IsOptional, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const DEFAULT_PAGE_SIZE = 100;

export class QueryOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  readonly pageSize: number;

  @IsOptional()
  @IsString()
  search: string;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.pageSize || DEFAULT_PAGE_SIZE);
  }
}
