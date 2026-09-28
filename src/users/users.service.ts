import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { RegisterUserDto } from './dto/register-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterUserDto): Promise<void> {
    const existingUser = await this.userRepo.findOne({ where: { username: dto.username } });
    
    if (existingUser) {
      throw new BadRequestException(); 
    }

    const newUser = this.userRepo.create({
      username: dto.username,
      password: dto.password, 
    });

    await this.userRepo.save(newUser);
  }
}