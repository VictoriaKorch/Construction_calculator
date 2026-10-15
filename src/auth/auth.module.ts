import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { SessionGuard } from './guards/session.guard.js';

@Module({
  imports: [UsersModule], // Импортируем, чтобы AuthController мог обращаться к UsersService
  controllers: [AuthController],
  providers: [SessionGuard],
  exports: [SessionGuard],
})
export class AuthModule {}