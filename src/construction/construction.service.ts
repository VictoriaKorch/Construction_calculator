// src/construction/construction.service.ts
import { Injectable } from '@nestjs/common';
import { IConstructionService } from './construction.model.js';

// Наша "база данных" - массив с услугами
const CONSTRUCTION_SERVICES: IConstructionService[] = [
  // ===== 1. Жилой дом панельный (ОПУБЛИКОВАН) =====
  {
    id: 1,
    title: 'Жилой дом панельный',
    description: 'Панельный жилой дом, 12 этажей, 4 подъезда.',
    price: 45000,
    area: 5000,
    category: 'Жилой',
    imageUrl: 'house1.jpg',
    videoUrl: 'house1.mp4',
    likes: [101, 102, 103],
    status: 'published',
  },

  // ===== 2. Жилой дом монолитный (ОПУБЛИКОВАН) =====
  {
    id: 2,
    title: 'Жилой дом монолитный',
    description: 'Монолитный жилой дом, 25 этажей, подземный паркинг.',
    price: 68000,
    area: 12000,
    category: 'Жилой',
    imageUrl: 'house2.jpg',
    videoUrl: 'house2.mp4',
    likes: [107, 108, 109, 110],
    status: 'published',
  },

  // ===== 3. Офисный центр (ОПУБЛИКОВАН) =====
  {
    id: 3,
    title: 'Офисный центр',
    description: 'Бизнес-центр класса А, 20 этажей, 5 подъездов.',
    price: 65000,
    area: 15000,
    category: 'Офисное',
    imageUrl: 'office.jpg',
    videoUrl: 'office.mp4',
    likes: [105, 106],
    status: 'published',
  },

  // ===== 4. Производственный цех (ОПУБЛИКОВАН) =====
  {
    id: 4,
    title: 'Производственный цех',
    description: 'Одноэтажный производственный цех с мостовым краном.',
    price: 28000,
    area: 8000,
    category: 'Производственное',
    imageUrl: 'industry.jpg',
    videoUrl: 'industry.mp4',
    likes: [112, 113],
    status: 'published',
  },

  // ===== 5. Школа на 800 мест (ОПУБЛИКОВАН) =====
  {
    id: 5,
    title: 'Школа на 800 мест',
    description: 'Типовой проект школы с бассейном и спортивным залом.',
    price: 38000,
    area: 12000,
    category: 'Образовательное',
    imageUrl: 'school.jpg',
    videoUrl: 'school.mp4',
    likes: [104],
    status: 'published',
  },

  // ===== 6. Поликлиника (ЧЕРНОВИК) =====
  {
    id: 6,
    title: 'Поликлиника',
    description: 'Поликлиника на 600 посещений в смену, 5 этажей.',
    price: 52000,
    area: 8000,
    category: 'Медицинское',
    imageUrl: 'clinic.jpg',
    videoUrl: 'clinic.mp4',
    likes: [],
    status: 'draft',
  },

  // ===== 7. Офисный центр (старый) (УДАЛЁН) =====
  {
    id: 7,
    title: 'Офисный центр (старый проект)',
    description: 'Устаревший проект офисного центра.',
    price: 55000,
    area: 10000,
    category: 'Офисное',
    imageUrl: 'office_old.jpg',
    videoUrl: 'office_old.mp4',
    likes: [117],
    status: 'deleted',
  },
];

@Injectable()
export class ConstructionService {
  // Получить все услуги, кроме удаленных
  getAllServices(): IConstructionService[] {
    return CONSTRUCTION_SERVICES.filter(s => s.status !== 'deleted');
  }

  // Получить одну услугу по ID
  getServiceById(id: number): IConstructionService | undefined {
    return CONSTRUCTION_SERVICES.find(
      s => s.id === id && s.status !== 'deleted'
    );
  }

  // Получить черновик
  getDraftService(): IConstructionService | undefined {
    return CONSTRUCTION_SERVICES.find(s => s.status === 'draft');
  }

  // Получить следующую услугу для ленты
  getNextService(currentId: number): IConstructionService | undefined {
    const published = CONSTRUCTION_SERVICES.filter(s => s.status === 'published');
    const currentIndex = published.findIndex(s => s.id === currentId);
    if (currentIndex === -1 || currentIndex === published.length - 1) {
      return published[0];
    }
    return published[currentIndex + 1];
  }

  // Фильтрация по цене
  filterByPrice(maxPrice: number): IConstructionService[] {
    return this.getAllServices().filter(s => s.price <= maxPrice);
  }
}