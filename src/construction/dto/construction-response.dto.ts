import { ApiProperty } from '@nestjs/swagger';

export class ConstructionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Проектирование инженерных сетей' })
  title: string;

  @ApiProperty({ example: 'Выполнение расчетов и прокладка сетей', nullable: true })
  description: string | null;

  @ApiProperty({ example: 150000, nullable: true })
  price: number | null;

  @ApiProperty({ example: 120, nullable: true })
  area: number | null;

  @ApiProperty({ example: 'http://localhost:9000/construction-assets/image-1.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: 'http://localhost:9000/construction-assets/video-1.mp4', nullable: true })
  videoUrl: string | null;

  @ApiProperty({ example: 5, description: 'Количество лайков' })
  likesCount: number;

  @ApiProperty({ example: 1, description: 'ID создателя из ER диаграммы' })
  creator_id: number; // ID создателя из ER диаграммы

  @ApiProperty({ example: 0, description: '0 - не поставил лайк, 1 - поставил' })
  isLiked: number;    // 0 - не поставил лайк, 1 - поставил

  @ApiProperty({ example: '2026-10-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-15T12:30:00.000Z' })
  formationDate: Date;
}