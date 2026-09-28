import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ConstructionServiceEntity } from './construction-service.entity.js';

@Entity('construction_service_likes')
export class Like {
  @PrimaryGeneratedColumn({ name: 'like_id' })
  id: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ConstructionServiceEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  service: ConstructionServiceEntity;
}