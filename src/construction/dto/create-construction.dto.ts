import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConstructionDto {
  @ApiProperty({ example: 'Проектирование инженерных сетей', description: 'Название строительной услуги' })
  @IsString()
  @MinLength(3)
  title: string;
}