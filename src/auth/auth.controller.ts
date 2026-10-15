import { Controller, Post, Body, HttpCode, Res, Req, UnauthorizedException } from '@nestjs/common';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service.js';
import { RegisterUserDto } from '../users/dto/register-user.dto.js';
import { SessionService } from '../session/session.service.js';

@Controller('auth') 
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterUserDto) {
    await this.usersService.register(dto);

  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const user = await this.usersService.validateUser(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    const sessionId = uuidv4();
    await this.sessionService.create(sessionId, user.id);
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await this.sessionService.destroy(sessionId);
    }
    res.clearCookie('sessionId');
  }
}