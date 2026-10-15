import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConstructionDto {
  @ApiProperty({ example: 'Проектирование инженерных сетей', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Выполнение расчетов и прокладка сетей', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area?: number;
}