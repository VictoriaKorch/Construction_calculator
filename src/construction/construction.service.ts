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

  async getNextService(currentId: number): Promise<any> {
    const published = await this.getPublishedServices();
    if (published.length === 0) return null;
    const currentIndex = published.findIndex(s => s.id === currentId);
    if (currentIndex === -1 || currentIndex === published.length - 1) {
      return published[0];
    }
    return published[currentIndex + 1];
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