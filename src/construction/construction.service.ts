import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConstructionServiceEntity } from './entities/construction-service.entity.js';
import { Like } from './entities/like.entity.js';

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(ConstructionServiceEntity)
    private serviceRepo: Repository<ConstructionServiceEntity>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
  ) {}

  // 1. Получение для Плитки (ЧЕРЕЗ ORM)
  async getPublishedServices(): Promise<any[]> {
    const services = await this.serviceRepo.find({ where: { status: 'published' } });
    
    return Promise.all(services.map(async (service) => {
      const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
      return { ...service, likesCount };
    }));
  }

  // Получение черновика конкретного пользователя (ЧЕРЕЗ ORM)
  async getDraft(userId: number = 1): Promise<ConstructionServiceEntity | null> {
    return await this.serviceRepo.findOne({ 
      where: { 
        status: 'draft',
        creator: { id: userId }
      },
      // ИСПРАВЛЕНО: Теперь используем объект вместо массива строк
      relations: { creator: true } 
    });
  }

  // Создание услуги с привязкой к пользователю (ЧЕРЕЗ ORM)
  async createDraft(title: string, userId: number = 1): Promise<ConstructionServiceEntity> {
    const existingDraft = await this.getDraft(userId);
    if (existingDraft) {
      return existingDraft;
    }

    const draft = this.serviceRepo.create({ 
      title, 
      status: 'draft', 
      price: null, 
      area: null,
      creator: { id: userId }
    });
    return await this.serviceRepo.save(draft);
  }

  // Получение по ID (ЧЕРЕЗ ORM)
  async getServiceById(id: number): Promise<any> {
    const service = await this.serviceRepo.findOne({ 
      where: { id, status: 'published' } 
    });
    if (!service) return null;
    
    const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
    return { ...service, likesCount };
  }

  // Получение ПЕРВОЙ карточки для ленты - строго 1 строка (ЧЕРЕЗ ORM)
  async getFirstService(): Promise<any> {
    const service = await this.serviceRepo.findOne({
      where: { status: 'published' },
      order: { id: 'ASC' }
    });
    if (!service) return null;

    const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
    return { ...service, likesCount };
  }

  // Получение СЛЕДУЮЩЕЙ карточки - строго 1 строка (ЧЕРЕЗ ORM)
  async getNextService(currentId: number): Promise<any> {
    let nextService = await this.serviceRepo.findOne({
      where: { 
        status: 'published', 
        id: MoreThan(currentId)
      },
      order: { id: 'ASC' }
    });
    
    if (!nextService) {
      return await this.getFirstService();
    }

    const likesCount = await this.likeRepo.count({ where: { service: { id: nextService.id } } });
    return { ...nextService, likesCount };
  }

  // Публикация услуги - смена статуса (ЧЕРЕЗ ORM)
  async publishService(id: number, data: Partial<ConstructionServiceEntity>): Promise<void> {
    await this.serviceRepo.update({ id }, { ...data, status: 'published' });
  }

  // Удаление услуги - СТРОГО СЫРОЙ SQL (С новыми названиями колонок)
  async softDeleteSql(id: number): Promise<void> {
    await this.serviceRepo.query(
      `UPDATE construction_service_items SET construction_service_status = $1 WHERE construction_service_item_id = $2`,
      ['deleted', id]
    );
  }
}