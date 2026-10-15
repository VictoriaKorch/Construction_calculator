import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'v.korchagina', description: 'Логин пользователя (минимум 3 символа)' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'pass1234', description: 'Пароль пользователя (минимум 4 символа)' })
  @IsString()
  @MinLength(4)
  password: string;
}