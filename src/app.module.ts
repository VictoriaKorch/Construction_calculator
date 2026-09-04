import { Module } from '@nestjs/common';
import { ConstructionModule } from './construction/construction.module.js';

@Module({
  imports: [ConstructionModule],
})
export class AppModule {}