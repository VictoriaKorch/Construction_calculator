import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, UseInterceptors, UploadedFiles, HttpCode, ParseBoolPipe, DefaultValuePipe } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConstructionService } from './construction.service.js';
import { ConstructionFiltersDto } from './dto/construction-filters.dto.js';
import { CreateConstructionDto } from './dto/create-construction.dto.js';
import { UpdateConstructionDto } from './dto/update-construction.dto.js';
import { ConstructionResponseDto } from './dto/construction-response.dto.js';
import { LikeDto } from './dto/like.dto.js';
import 'multer'; 

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Get()
  async getList(@Query() filters: ConstructionFiltersDto): Promise<ConstructionResponseDto[]> {
    return this.constructionService.getPublishedServices(filters);
  }

  // Получить ленту (одна карточка). Поддержка ?id=...&next=true
  @Get('feed')
  async getFeed(
    @Query('id') id?: string,
    @Query('next', new DefaultValuePipe(false), ParseBoolPipe) next?: boolean
  ): Promise<ConstructionResponseDto> {
    const parsedId = id ? parseInt(id, 10) : undefined;
    return this.constructionService.getFeed(parsedId, next);
  }

  @Get('draft')
  async getDraft(): Promise<ConstructionResponseDto | null> {
    const draft = await this.constructionService.getDraft();
    return draft ? draft : null;
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]))
  async createService(
    @Body() createDto: CreateConstructionDto,
    @UploadedFiles() files: { image?: Express.Multer.File[], video?: Express.Multer.File[] },
  ): Promise<ConstructionResponseDto> {
    const imageFile = files?.image ? files.image[0] : undefined;
    const videoFile = files?.video ? files.video[0] : undefined;
    return this.constructionService.createService(createDto, imageFile, videoFile);
  }

  // PUT принимает DTO с полями для заполнения черновика
  @Put(':id/publish')
  async publishService(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConstructionDto
  ): Promise<ConstructionResponseDto> {
    return this.constructionService.publishService(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteService(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.constructionService.softDeleteSql(id);
  }

  @Post(':id/like')
  @HttpCode(204)
  async handleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() likeDto: LikeDto
  ): Promise<void> {
    await this.constructionService.handleLike(id, likeDto.action);
  }
}