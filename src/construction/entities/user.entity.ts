import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('construction_service_users')
export class User {
  @PrimaryGeneratedColumn({ name: 'construction_service_user_id' })
  id: number;

  @Column({ name: 'construction_service_username', type: 'varchar', length: 50 })
  username: string;
}