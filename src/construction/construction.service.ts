import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Метод для получения всех карточек (остается для страницы Плитки)
  async getPublishedServices(): Promise<any[]> {
    const services = await this.serviceRepo.find({ where: { status: 'published' } });
    
    return Promise.all(services.map(async (service) => {
      const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
      return { ...service, likesCount };
    }));
  }

  async getDraft(): Promise<ConstructionServiceEntity | null> {
    return await this.serviceRepo.findOne({ where: { status: 'draft' } });
  }

  async createDraft(title: string): Promise<ConstructionServiceEntity> {
    const draft = this.serviceRepo.create({ title, status: 'draft', price: null, area: null });
    return await this.serviceRepo.save(draft);
  }

  async getServiceById(id: number): Promise<any> {
    const rows = await this.serviceRepo.query(
      `SELECT * FROM construction_services WHERE id = $1 AND status = 'published'`,
      [id]
    );
    const service = rows[0] ?? null;
    if (!service) return null;
    
    const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
    return { ...service, likesCount };
  }

  // Новый метод: получить строго ПЕРВУЮ опубликованную карточку (только 1 строку)
  async getFirstService(): Promise<any> {
    const rows = await this.serviceRepo.query(
      `SELECT * FROM construction_services WHERE status = 'published' ORDER BY id ASC LIMIT 1`
    );
    const service = rows[0] ?? null;
    if (!service) return null;

    const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
    return { ...service, likesCount };
  }

  // Обновленный метод: получить строго СЛЕДУЮЩУЮ карточку (только 1 строку)
  async getNextService(currentId: number): Promise<any> {
    const rows = await this.serviceRepo.query(
      `SELECT * FROM construction_services WHERE status = 'published' AND id > $1 ORDER BY id ASC LIMIT 1`,
      [currentId]
    );
    
    let nextService = rows[0] ?? null;

    // Если следующей карточки нет, возвращаемся к первой
    if (!nextService) {
      return await this.getFirstService();
    }

    const likesCount = await this.likeRepo.count({ where: { service: { id: nextService.id } } });
    return { ...nextService, likesCount };
  }

  async publishService(id: number, data: Partial<ConstructionServiceEntity>): Promise<void> {
    await this.serviceRepo.update({ id }, { ...data, status: 'published' });
  }

  async softDeleteSql(id: number): Promise<void> {
    await this.serviceRepo.query(
      `UPDATE construction_services SET status = $1 WHERE id = $2`,
      ['deleted', id]
    );
  }
}