import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, UseInterceptors, UploadedFiles, HttpCode, ParseBoolPipe, DefaultValuePipe, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { ConstructionService } from './construction.service.js';
import { SessionService } from '../session/session.service.js';
import { ConstructionFiltersDto } from './dto/construction-filters.dto.js';
import { CreateConstructionDto } from './dto/create-construction.dto.js';
import { UpdateConstructionDto } from './dto/update-construction.dto.js';
import { ConstructionResponseDto } from './dto/construction-response.dto.js';
import { LikeDto } from './dto/like.dto.js';
import { SessionGuard } from '../auth/guards/session.guard.js';
import 'multer'; 

@Controller('construction')
export class ConstructionController {
  constructor(
    private readonly constructionService: ConstructionService,
    private readonly sessionService: SessionService
  ) {}

  private async getOptionalUserId(req: express.Request): Promise<number | undefined> {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      const userId = await this.sessionService.getUserId(sessionId);
      return userId ? userId : undefined;
    }
    return undefined;
  }

  @Get()
  async getList(
    @Req() req: express.Request, // Перенесли на первое место
    @Query() filters: ConstructionFiltersDto
  ): Promise<ConstructionResponseDto[]> {
    const userId = await this.getOptionalUserId(req);
    return this.constructionService.getPublishedServices(filters, userId);
  }

  @Get('feed')
  async getFeed(
    @Req() req: express.Request, // Перенесли на первое место
    @Query('id') id?: string,
    @Query('next', new DefaultValuePipe(false), ParseBoolPipe) next?: boolean
  ): Promise<ConstructionResponseDto> {
    if (id === undefined && next === false) {
      throw new BadRequestException(); 
    }
    const parsedId = id ? parseInt(id, 10) : undefined;
    const userId = await this.getOptionalUserId(req);
    return this.constructionService.getFeed(parsedId, next, userId);
  }

  @Get('draft')
  @UseGuards(SessionGuard)
  async getDraft(@Req() req: any): Promise<ConstructionResponseDto | null> {
    const draft = await this.constructionService.getDraft(req.userId);
    return draft ? draft : null;
  }

  @Post()
  @UseGuards(SessionGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]))
  async createService(
    @Body() createDto: CreateConstructionDto,
    @UploadedFiles() files: { image?: Express.Multer.File[], video?: Express.Multer.File[] },
    @Req() req: any 
  ): Promise<ConstructionResponseDto> {
    const imageFile = files?.image ? files.image[0] : undefined;
    const videoFile = files?.video ? files.video[0] : undefined;
    return this.constructionService.createService(createDto, imageFile, videoFile, req.userId);
  }

  @Put(':id/publish')
  @UseGuards(SessionGuard)
  async publishService(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConstructionDto,
    @Req() req: any 
  ): Promise<ConstructionResponseDto> {
    return this.constructionService.publishService(id, updateDto, req.userId);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @HttpCode(204)
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any 
  ): Promise<void> {
    await this.constructionService.softDeleteSql(id, req.userId);
  }

  @Post(':id/like')
  @UseGuards(SessionGuard)
  @HttpCode(204)
  async handleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() likeDto: LikeDto,
    @Req() req: any 
  ): Promise<void> {
    await this.constructionService.handleLike(id, likeDto.action, req.userId);
  }
}