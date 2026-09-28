import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionServiceEntity } from './entities/construction-service.entity.js';
import { Like } from './entities/like.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ConstructionResponseDto } from './dto/construction-response.dto.js';
import { ConstructionFiltersDto } from './dto/construction-filters.dto.js';
import { CreateConstructionDto } from './dto/create-construction.dto.js';
import { UpdateConstructionDto } from './dto/update-construction.dto.js';
import { MinioSimpleService } from './minio.service.js';
import { getCurrentUserId } from '../common/current-user.js';
import 'multer';

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(ConstructionServiceEntity)
    private serviceRepo: Repository<ConstructionServiceEntity>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private minioService: MinioSimpleService,
  ) {}

  private async toResponseDto(service: ConstructionServiceEntity): Promise<ConstructionResponseDto> {
    const likesCount = await this.likeRepo.count({ where: { service: { id: service.id } } });
    const isCreator = service.creator?.id === getCurrentUserId() ? 1 : 0;
    
    return {
      id: service.id,
      title: service.title,
      description: service.description ?? null,
      price: service.price ?? null,
      area: service.area ?? null,
      imageUrl: (await this.minioService.getSignedUrl(service.imageUrl)) ?? null,
      videoUrl: (await this.minioService.getSignedUrl(service.videoUrl)) ?? null,
      likesCount: likesCount,
      isCreator: isCreator,
      createdAt: service.createdAt,
      formationDate: service.formationDate
    };
  }

  async getPublishedServices(filters: ConstructionFiltersDto): Promise<ConstructionResponseDto[]> {
    const query = this.serviceRepo.createQueryBuilder('service')
      .leftJoinAndSelect('service.creator', 'creator')
      .where('service.status = :status', { status: 'published' });

    if (filters.minPrice !== undefined) {
      query.andWhere('service.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      query.andWhere('service.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    const services = await query.getMany();
    return Promise.all(services.map(s => this.toResponseDto(s)));
  }

  async getFeed(id?: number, next?: boolean): Promise<ConstructionResponseDto> {
    let query = this.serviceRepo.createQueryBuilder('service')
      .leftJoinAndSelect('service.creator', 'creator')
      .where('service.status = :status', { status: 'published' })
      .orderBy('service.id', 'ASC');

    if (id) {
      if (next) {
        query.andWhere('service.id > :id', { id });
      } else {
        query.andWhere('service.id = :id', { id });
      }
    }

    let service = await query.getOne();

    if (!service && id && next) {
      service = await this.serviceRepo.findOne({
        where: { status: 'published' },
        order: { id: 'ASC' },
        relations: { creator: true }
      });
    }

    if (!service) throw new NotFoundException(); 
    return this.toResponseDto(service);
  }

  async getDraft(): Promise<ConstructionResponseDto | null> {
    const draft = await this.serviceRepo.findOne({ 
      where: { status: 'draft', creator: { id: getCurrentUserId() } },
      relations: { creator: true }
    });
    if (!draft) return null;
    return this.toResponseDto(draft);
  }

  async createService(
    dto: CreateConstructionDto, 
    image?: Express.Multer.File, 
    video?: Express.Multer.File
  ): Promise<ConstructionResponseDto> {
    
    const draft = await this.serviceRepo.findOne({ where: { status: 'draft', creator: { id: getCurrentUserId() } }});
    if (draft) throw new BadRequestException(); 

    const user = await this.userRepo.findOne({ where: { id: getCurrentUserId() } });
    if (!user) throw new NotFoundException();

    const newService = this.serviceRepo.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      area: dto.area,
      status: 'draft',
      creator: user
    });
    
    let savedService = await this.serviceRepo.save(newService);

    if (image) {
      savedService.imageUrl = await this.minioService.uploadMedia(image.buffer, image.originalname, savedService.id, 'image');
    }
    if (video) {
      savedService.videoUrl = await this.minioService.uploadMedia(video.buffer, video.originalname, savedService.id, 'video');
    }

    savedService = await this.serviceRepo.save(savedService);
    return this.toResponseDto(savedService);
  }

  async publishService(id: number, dto: UpdateConstructionDto): Promise<ConstructionResponseDto> {
    const service = await this.serviceRepo.findOne({ 
      where: { id, creator: { id: getCurrentUserId() } }, 
      relations: { creator: true }
    });
    
    if (!service) throw new NotFoundException();
    if (service.status !== 'draft') throw new BadRequestException(); 
    
    if (dto.title) service.title = dto.title;
    if (dto.description) service.description = dto.description;
    if (dto.price !== undefined) service.price = dto.price;
    if (dto.area !== undefined) service.area = dto.area;

    service.status = 'published';
    await this.serviceRepo.save(service);
    return this.toResponseDto(service);
  }

  async softDeleteSql(id: number): Promise<void> {
    await this.serviceRepo.query(
      `UPDATE construction_service_items SET status = $1 WHERE item_id = $2 AND creator_id = $3`,
      ['deleted', id, getCurrentUserId()]
    );
  }

  async handleLike(id: number, action: number): Promise<void> {
    const service = await this.serviceRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException();
    
    const user = await this.userRepo.findOne({ where: { id: getCurrentUserId() } });
    if (!user) throw new NotFoundException();

    const existingLike = await this.likeRepo.findOne({ where: { service: { id }, user: { id: getCurrentUserId() } } });

    if (action === 1 && !existingLike) {
      const newLike = this.likeRepo.create({ service, user });
      await this.likeRepo.save(newLike);
    } else if (action === 0 && existingLike) {
      await this.likeRepo.remove(existingLike);
    }
  }
}