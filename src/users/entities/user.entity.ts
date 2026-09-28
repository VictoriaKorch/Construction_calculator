import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('construction_service_users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'username', type: 'varchar', length: 50 })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password: string;
}