import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('construction_services')
export class ConstructionServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  price: number | null; 

  @Column({ type: 'int', nullable: true })
  area: number | null; 

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  videoUrl: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; 

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  formationDate: Date; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}