import { IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LikeDto {
  @ApiProperty({ example: 1, description: '0 - удалить лайк, 1 - поставить лайк' })
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  action: number; // 0 - удалить лайк, 1 - поставить
}