import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionServiceEntity } from './entities/construction-service.entity.js';
import { Like } from './entities/like.entity.js';
import { MinioSimpleService } from './minio.service.js';
import { CreateConstructionDto } from './dto/create-construction.dto.js';
import { UpdateConstructionDto } from './dto/update-construction.dto.js';
import { ConstructionFiltersDto } from './dto/construction-filters.dto.js';
import { ConstructionResponseDto } from './dto/construction-response.dto.js';

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(ConstructionServiceEntity)
    private constructionRepository: Repository<ConstructionServiceEntity>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    private minioService: MinioSimpleService,
  ) {}

  async toResponseDto(service: ConstructionServiceEntity, userId?: number): Promise<ConstructionResponseDto> {
    let isLiked = 0;
    if (userId) {
      const like = await this.likeRepository.findOne({ 
        where: { service: { id: service.id }, user: { id: userId } } 
      });
      if (like) isLiked = 1;
    }

    const likesCount = await this.likeRepository.count({ 
      where: { service: { id: service.id } } 
    });

    return {
      id: service.id,
      title: service.title ?? null,
      description: service.description ?? null,
      price: service.price ?? null,
      area: service.area ?? null,
      imageUrl: service.imageUrl ?? null,
      videoUrl: service.videoUrl ?? null,
      likesCount: likesCount,
      creator_id: service.creator?.id ?? null, 
      isLiked: isLiked,
      createdAt: service.createdAt,
      formationDate: service.formationDate ?? null,
    };
  }

  async getPublishedServices(filters: ConstructionFiltersDto, userId?: number): Promise<ConstructionResponseDto[]> {
    const query = this.constructionRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.creator', 'creator')
      .where('service.status = :status', { status: 'published' });

    if (filters.minPrice) {
      query.andWhere('service.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice) {
      query.andWhere('service.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    const services = await query.getMany();
    return Promise.all(services.map(s => this.toResponseDto(s, userId)));
  }

  async getFeed(id?: number, next: boolean = false, userId?: number): Promise<ConstructionResponseDto> {
    const query = this.constructionRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.creator', 'creator')
      .where('service.status = :status', { status: 'published' })
      .orderBy('service.id', 'ASC');

    if (id !== undefined) {
      if (next) {
        query.andWhere('service.id > :id', { id });
      } else {
        query.andWhere('service.id = :id', { id });
      }
    }

    const service = await query.getOne();
    if (!service) {
      throw new NotFoundException();
    }

    return this.toResponseDto(service, userId);
  }

  async getDraft(userId: number): Promise<ConstructionResponseDto | null> {
    const draft = await this.constructionRepository.findOne({
      where: { creator: { id: userId }, status: 'draft' },
      relations: { creator: true } 
    });
    if (!draft) return null;
    return this.toResponseDto(draft, userId);
  }

  async createService(
    createDto: CreateConstructionDto,
    imageFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
    userId?: number
  ): Promise<ConstructionResponseDto> {
    
    // Блокируем создание, если не переданы обязательные файлы
    if (!imageFile || !videoFile) {
      throw new BadRequestException(); 
    }

    // 1. Создаем черновик без файлов, чтобы сгенерировался ID
    const newService = this.constructionRepository.create({
      title: createDto.title,
      status: 'draft',
      creator: { id: userId }, 
    });
    let savedService = await this.constructionRepository.save(newService);

    // 2. Загружаем файлы в Minio (они точно существуют, так как прошли проверку выше)
    const imageUrl = await this.minioService.uploadMedia(imageFile.buffer, imageFile.originalname, savedService.id, 'image');
    const videoUrl = await this.minioService.uploadMedia(videoFile.buffer, videoFile.originalname, savedService.id, 'video');

    // 3. Сохраняем URL файлов в БД
    savedService.imageUrl = imageUrl;
    savedService.videoUrl = videoUrl;
    savedService = await this.constructionRepository.save(savedService);

    const completeService = await this.constructionRepository.findOne({
      where: { id: savedService.id },
      relations: { creator: true }
    });

    return this.toResponseDto(completeService!, userId);
  }

  async publishService(id: number, updateDto: UpdateConstructionDto, userId: number): Promise<ConstructionResponseDto> {
    const service = await this.constructionRepository.findOne({ 
      where: { id },
      relations: { creator: true } 
    });
    
    if (!service) {
      throw new NotFoundException(); 
    }
    
    if (service.creator?.id !== userId) {
      throw new ForbiddenException(); 
    }

    if (updateDto.description !== undefined) service.description = updateDto.description;
    if (updateDto.price !== undefined) service.price = updateDto.price;
    if (updateDto.area !== undefined) service.area = updateDto.area;
    
    service.status = 'published';
    service.formationDate = new Date();
    
    const updatedService = await this.constructionRepository.save(service);
    return this.toResponseDto(updatedService, userId);
  }

  async softDeleteSql(id: number, userId: number): Promise<void> {
    const service = await this.constructionRepository.findOne({ 
      where: { id },
      relations: { creator: true } 
    });
    
    if (!service) {
      throw new NotFoundException(); 
    }
    
    if (service.creator?.id !== userId) {
      throw new ForbiddenException(); 
    }

    await this.constructionRepository.softDelete(id);
  }

  async handleLike(id: number, action: number, userId: number): Promise<void> {
    const service = await this.constructionRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException();
    }

    const existingLike = await this.likeRepository.findOne({
      where: { service: { id }, user: { id: userId } }
    });

    if (action === 1) {
      if (!existingLike) {
        const newLike = this.likeRepository.create({ service: { id }, user: { id: userId } });
        await this.likeRepository.save(newLike);
      }
    } else if (action === 0) {
      if (existingLike) {
        await this.likeRepository.remove(existingLike);
      }
    } else {
      throw new BadRequestException(); 
    }
  }
}