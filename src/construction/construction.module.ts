import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionController } from './construction.controller.js';
import { ConstructionService } from './construction.service.js';
import { ConstructionServiceEntity } from './entities/construction-service.entity.js';
import { Like } from './entities/like.entity.js';
import { User } from './entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionServiceEntity, Like, User])],
  controllers: [ConstructionController],
  providers: [ConstructionService],
})
export class ConstructionModule {}