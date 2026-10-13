import { IsString, MinLength } from 'class-validator';

export class CreateConstructionDto {
  @IsString()
  @MinLength(3)
  title: string;
}