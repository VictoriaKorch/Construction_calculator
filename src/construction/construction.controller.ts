import { Controller, Get, Post, Param, Query, Body, Render, Redirect, Res } from '@nestjs/common';
import { ConstructionService } from './construction.service.js';

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Get('tile')
  @Render('tile')
  async getTilePage(
    @Query('minPrice') minPriceQuery?: string,
    @Query('maxPrice') maxPriceQuery?: string
  ) {
    let services = await this.constructionService.getPublishedServices();

    let minLimit = services.length > 0 ? Math.min(...services.map(s => Number(s.price))) : 0;
    let maxLimit = services.length > 0 ? Math.max(...services.map(s => Number(s.price))) : 150000;

    let min = minPriceQuery ? Number(minPriceQuery) : NaN;
    let max = maxPriceQuery ? Number(maxPriceQuery) : NaN;

    if (!isNaN(min) && !isNaN(max) && min > max) {
      const temp = min; min = max; max = temp;
    }
    if (!isNaN(min)) services = services.filter(s => Number(s.price) >= min);
    if (!isNaN(max)) services = services.filter(s => Number(s.price) <= max);

    return { title: 'Список проектов', ConstructionServices: services, currentMin: !isNaN(min) ? min : minLimit, currentMax: !isNaN(max) ? max : maxLimit, minLimit, maxLimit, navTileActive: true };
  }

  @Get('feed')
  @Render('feed')
  async getFeed(@Query('id') id?: string, @Query('next') next?: string) {
    let service = null;
    
    if (id) {
      service = await this.constructionService.getServiceById(Number(id));
      if (next === 'true' && service) {
        // Запрашиваем только одну следующую карточку
        service = await this.constructionService.getNextService(service.id);
      }
    } else {
      // При первой загрузке ленты запрашиваем строго первую карточку
      service = await this.constructionService.getFirstService();
    }

    return { title: 'Лента', ConstructionService: service, navFeedActive: true };
  }

  @Get('add')
  @Render('add')
  async getAddPage() {
    const draft = await this.constructionService.getDraft();
    return { 
      title: 'Добавление проекта', 
      ConstructionService: draft, 
      hasDraft: !!draft, 
      navAddActive: true 
    };
  }

  @Post('add-draft')
  async createDraft(@Body('title') title: string, @Res() res: any) {
    if (!title) {
      return res.render('add', {
        title: 'Добавление проекта',
        hasDraft: false,
        navAddActive: true,
        errorTitle: true 
      });
    }

    await this.constructionService.createDraft(title);
    return res.redirect('/construction/add');
  }

  @Post('publish')
  async publishDraft(
    @Body('id') id: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('price') price: string,
    @Body('area') area: string,
    @Res() res: any 
  ) {
    if (!title || !description || !price || !area) {
      return res.render('add', {
        title: 'Публикация проекта',
        hasDraft: true,
        navAddActive: true,
        ConstructionService: { id, title, description, price, area },
        errorTitle: !title,
        errorDesc: !description,
        errorPrice: !price,
        errorArea: !area
      });
    }

    await this.constructionService.publishService(Number(id), {
      title,
      description,
      price: Number(price),
      area: Number(area)
    });
    return res.redirect('/construction/tile');
  }

  @Post('delete')
  @Redirect('/construction/tile')
  async deleteService(@Body('service_id') serviceId: string) {
    await this.constructionService.softDeleteSql(Number(serviceId));
  }
}