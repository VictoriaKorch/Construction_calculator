import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('construction_service_items')
export class ConstructionServiceEntity {
  @PrimaryGeneratedColumn({ name: 'construction_service_item_id' })
  id: number;

  @Column({ name: 'construction_service_title', type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'construction_service_description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'construction_service_price', type: 'int', nullable: true })
  price: number | null; 

  @Column({ name: 'construction_service_area', type: 'int', nullable: true })
  area: number | null; 

  @Column({ name: 'construction_service_image_url', type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ name: 'construction_service_video_url', type: 'varchar', nullable: true })
  videoUrl: string;

  @Column({ name: 'construction_service_status', type: 'varchar', length: 20, default: 'draft' })
  status: string; 

  @CreateDateColumn({ name: 'construction_service_created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'construction_service_formed_at' })
  formationDate: Date; 

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'construction_service_creator_id' })
  creator: User;
}