import { IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class LikeDto {
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  action: number; // 0 - удалить лайк, 1 - поставить
}