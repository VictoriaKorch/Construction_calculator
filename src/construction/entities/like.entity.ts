import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { ConstructionServiceEntity } from './construction-service.entity.js';

@Entity('construction_service_likes')
export class Like {
  @PrimaryGeneratedColumn({ name: 'construction_service_like_id' })
  id: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'construction_service_user_id' })
  user: User;

  @ManyToOne(() => ConstructionServiceEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'construction_service_item_id' })
  service: ConstructionServiceEntity;
}