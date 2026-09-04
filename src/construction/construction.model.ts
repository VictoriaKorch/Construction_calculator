// src/construction/construction.model.ts

// Интерфейс одной услуги (УПС - Укрупненный Показатель Стоимости)
export interface IConstructionService {
  id: number;
  title: string;              // Название
  description: string;        // Описание
  price: number;             // Стоимость за м² (ПОЛЕ ПО ТЕМЕ)
  area: number;              // Площадь в м² (ПОЛЕ ПО ТЕМЕ)
  category: string;          // Тип здания
  imageUrl: string;          // Название файла картинки
  videoUrl: string;          // Название файла видео
  likes: number[];           // Массив ID пользователей, которые лайкнули
  status: 'draft' | 'published' | 'deleted';
}