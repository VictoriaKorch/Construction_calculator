import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { ConstructionServiceEntity } from '../src/construction/entities/construction-service.entity.js';
import { User } from '../src/construction/entities/user.entity.js';
import { Like } from '../src/construction/entities/like.entity.js';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'student',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'construction_db',
  entities: [User, ConstructionServiceEntity, Like],
  synchronize: true, 
});

async function run() {
  await dataSource.initialize();
  await dataSource.synchronize();
  console.log('Таблицы успешно созданы!');
  await dataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('Ошибка создания таблиц:', err);
  process.exit(1);
});