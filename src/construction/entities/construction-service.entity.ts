import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity.js';

@Entity('construction_service_items')
export class ConstructionServiceEntity {
  @PrimaryGeneratedColumn({ name: 'item_id' })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'price', type: 'int', nullable: true })
  price: number | null; 

  @Column({ name: 'area', type: 'int', nullable: true })
  area: number | null; 

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ name: 'video_url', type: 'varchar', nullable: true })
  videoUrl: string;

  @Exclude()
  @Column({ name: 'status', type: 'varchar', length: 20, default: 'draft' })
  status: string; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'formed_at' })
  formationDate: Date; 

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}