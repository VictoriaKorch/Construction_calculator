// src/construction/construction.controller.ts
import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { ConstructionService as ConstructionServiceLogic } from './construction.service.js';

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionServiceLogic: ConstructionServiceLogic) {}

  // ===== ЛЕНТА =====
  @Get('feed')
  @Render('feed')
  getFeed(@Query('id') id?: string, @Query('next') next?: string) {
    let ConstructionService;
    if (id) {
      ConstructionService = this.constructionServiceLogic.getServiceById(Number(id));
    } else {
      const all = this.constructionServiceLogic.getAllServices();
      ConstructionService = all.find(s => s.status === 'published');
    }

    if (next === 'true' && ConstructionService) {
      ConstructionService = this.constructionServiceLogic.getNextService(ConstructionService.id);
    }

    if (!ConstructionService) {
      return { 
        title: 'Лента', 
        ConstructionService: null, 
        navFeedActive: true 
      };
    }

    return {
      title: 'Лента строительных проектов',
      ConstructionService: ConstructionService,
      likesCount: ConstructionService.likes.length,
      navFeedActive: true 
    };
  }

  // ===== ДОБАВЛЕНИЕ (Черновик) =====
  @Get('add')
  @Render('add')
  getAddPage() {
    const draft = this.constructionServiceLogic.getDraftService();
    return {
      title: 'Добавление проекта',
      ConstructionService: draft,
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
    let ConstructionServices = this.constructionServiceLogic.getAllServices();
    
    // Оставляем только опубликованные
    ConstructionServices = ConstructionServices.filter(s => s.status === 'published');

    // 1. Вычисляем динамические лимиты ОТ и ДО по реальной базе
    let minLimit = 0;
    let maxLimit = 150000;
    if (ConstructionServices.length > 0) {
      minLimit = Math.min(...ConstructionServices.map(s => s.price));
      maxLimit = Math.max(...ConstructionServices.map(s => s.price));
    }

    let min = minPriceQuery ? Number(minPriceQuery) : NaN;
    let max = maxPriceQuery ? Number(maxPriceQuery) : NaN;

    // 2. ДУРАКОУСТОЙЧИВОСТЬ: Если От больше, чем До
    if (!isNaN(min) && !isNaN(max) && min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    // 3. Фильтрация массива
    if (!isNaN(min)) {
      ConstructionServices = ConstructionServices.filter(s => s.price >= min);
    }
    if (!isNaN(max)) {
      ConstructionServices = ConstructionServices.filter(s => s.price <= max);
    }

    const ConstructionServicesWithLikes = ConstructionServices.map(s => ({
      ...s,
      likesCount: s.likes.length,
    }));

    return {
      title: 'Список проектов',
      ConstructionServices: ConstructionServicesWithLikes,
      currentMin: !isNaN(min) ? min : minLimit,
      currentMax: !isNaN(max) ? max : maxLimit,
      minLimit: minLimit,
      maxLimit: maxLimit,
      navTileActive: true 
    };
  }
}