// src/construction/construction.controller.ts
import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { ConstructionService } from './construction.service.js';

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  // ===== ЛЕНТА =====
  @Get('feed')
  @Render('feed')
  getFeed(@Query('id') id?: string, @Query('next') next?: string) {
    let service;
    if (id) {
      service = this.constructionService.getServiceById(Number(id));
    } else {
      const all = this.constructionService.getAllServices();
      service = all.find(s => s.status === 'published');
    }

    if (next === 'true' && service) {
      service = this.constructionService.getNextService(service.id);
    }

    if (!service) {
      return { 
        title: 'Лента', 
        service: null, 
        navFeedActive: true 
      };
    }

    return {
      title: 'Лента строительных проектов',
      service: service,
      likesCount: service.likes.length,
      navFeedActive: true 
    };
  }

  // ===== ДОБАВЛЕНИЕ (Черновик) =====
  @Get('add')
  @Render('add')
  getAddPage() {
    const draft = this.constructionService.getDraftService();
    return {
      title: 'Добавление проекта',
      service: draft,
      navAddActive: true 
    };
  }

  // ===== ПЛИТКА =====
  @Get('tile')
  @Render('tile')
  getTilePage(
    @Query('minPrice') minPriceQuery?: string,
    @Query('maxPrice') maxPriceQuery?: string
  ) {
    let services = this.constructionService.getAllServices();
    
    // Оставляем только опубликованные
    services = services.filter(s => s.status === 'published');

    // 1. Вычисляем динамические лимиты ОТ и ДО по реальной базе
    let minLimit = 0;
    let maxLimit = 150000;
    if (services.length > 0) {
      minLimit = Math.min(...services.map(s => s.price));
      maxLimit = Math.max(...services.map(s => s.price));
    }

    let min = minPriceQuery ? Number(minPriceQuery) : NaN;
    let max = maxPriceQuery ? Number(maxPriceQuery) : NaN;

    // 2. ДУРАКОУСТОЙЧИВОСТЬ: Если пользователь задал От больше, чем До, меняем их местами
    if (!isNaN(min) && !isNaN(max) && min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    // 3. Фильтрация массива
    if (!isNaN(min)) {
      services = services.filter(s => s.price >= min);
    }
    if (!isNaN(max)) {
      services = services.filter(s => s.price <= max);
    }

    const servicesWithLikes = services.map(s => ({
      ...s,
      likesCount: s.likes.length,
    }));

    return {
      title: 'Список проектов',
      services: servicesWithLikes,
      
      // Передаем текущие выбранные значения (или лимиты по умолчанию, если ничего не выбрано)
      currentMin: !isNaN(min) ? min : minLimit,
      currentMax: !isNaN(max) ? max : maxLimit,
      
      // Передаем абсолютные лимиты для краев ползунка
      minLimit: minLimit,
      maxLimit: maxLimit,
      
      navTileActive: true 
    };
  }
}