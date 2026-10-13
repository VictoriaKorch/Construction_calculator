export class ConstructionResponseDto {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  area: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  likesCount: number;
  creator_id: number; // Исправление 3: ID создателя из ER диаграммы
  isLiked: number;    // Исправление 2: 0 - не поставил лайк, 1 - поставил
  createdAt: Date;
  formationDate: Date;
}