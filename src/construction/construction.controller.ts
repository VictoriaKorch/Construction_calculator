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
      return { title: 'Лента', service: null };
    }

    return {
      title: 'Лента строительных проектов',
      service: service,
      likesCount: service.likes.length,
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
    };
  }

  // ===== ПЛИТКА =====
  @Get('tile')
  @Render('tile')
  getTilePage(@Query('filterPrice') filterPrice?: string) {
    let services = this.constructionService.getAllServices();

    if (filterPrice) {
      const maxPrice = Number(filterPrice);
      if (!isNaN(maxPrice)) {
        services = this.constructionService.filterByPrice(maxPrice);
      }
    }

    const servicesWithLikes = services.map(s => ({
      ...s,
      likesCount: s.likes.length,
    }));

    return {
      title: 'Список проектов',
      services: servicesWithLikes,
      currentFilter: filterPrice || '',
    };
  }
}