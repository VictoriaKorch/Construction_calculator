import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { ConstructionServiceEntity } from './construction-service.entity.js';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ConstructionServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service: ConstructionServiceEntity;
}