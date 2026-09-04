// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import hbs from 'hbs';

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Путь к папке views
  const viewsPath = join(__dirname, '..', 'views');
  
  // Регистрируем partials ПЕРЕД настройкой шаблонов
  hbs.registerPartials(join(viewsPath, 'partials'));

  // Настройка шаблонов (Handlebars)
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');

  // Настройка статики (CSS, изображения)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(3000);
}
bootstrap();