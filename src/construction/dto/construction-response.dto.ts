export class ConstructionResponseDto {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  area: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  likesCount: number;
  isCreator: number; // 0 или 1
  createdAt: Date;
  formationDate: Date;
}