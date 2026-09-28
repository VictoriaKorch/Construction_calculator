import { IsString, IsNumber, MinLength, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConstructionDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area?: number;
}