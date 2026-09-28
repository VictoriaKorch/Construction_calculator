import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConstructionFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}