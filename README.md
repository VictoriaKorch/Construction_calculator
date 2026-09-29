# Веб-сервис: Расчет стоимости строительства квартала/микрорайона

REST API сервис для системы расчета укрупненных показателей стоимости строительства зданий (жилые, офисные, производственные, поликлиники, школы). Бэкенд реализован на NestJS с использованием PostgreSQL и MinIO.

---

## 1. Структура базы данных (PostgreSQL)

В базе данных реализовано 3 таблицы в соответствии с предметной областью.

### 1.1 Таблица пользователей (`construction_service_users`)
| Поле | Тип | Описание |
|---|---|---|
| `user_id` | INT (PK) | Уникальный идентификатор пользователя |
| `username` | VARCHAR(50) | Имя пользователя (логин) |
| `password` | VARCHAR(100) | Пароль пользователя |

### 1.2 Таблица услуг/проектов (`construction_service_items`)
| Поле | Тип | Описание |
|---|---|---|
| `item_id` | INT (PK) | Уникальный идентификатор проекта |
| `title` | VARCHAR(150) | Название проекта |
| `description` | TEXT | Описание проекта |
| `price` | INT | Стоимость строительства за 1 м² (УПС) |
| `area` | INT | Площадь здания в м² |
| `image_url` | VARCHAR | Имя файла изображения в MinIO |
| `video_url` | VARCHAR | Имя файла видео в MinIO |
| `status` | VARCHAR(20) | Статус (draft, published, deleted) |
| `created_at` | TIMESTAMP | Дата и время создания записи |
| `formed_at` | TIMESTAMP | Дата и время последнего обновления |
| `creator_id` | INT (FK) | ID пользователя-создателя (ссылка на users) |

### 1.3 Таблица лайков (`construction_service_likes`) - связь М-М
| Поле | Тип | Описание |
|---|---|---|
| `like_id` | INT (PK) | Уникальный идентификатор лайка |
| `user_id` | INT (FK) | ID пользователя, поставившего лайк |
| `item_id` | INT (FK) | ID проекта, которому поставлен лайк |

---

## 2. Методы веб-сервиса (REST API)

Всего реализовано 10 обязательных методов, разделенных на 2 домена: «Услуги» и «Пользователи». 

*Примечание: В выходных данных объект `ConstructionResponseDto` содержит фиксированный набор полей: `id`, `title`, `description`, `price`, `area`, `imageUrl`, `videoUrl`, `likesCount`, `isCreator` (0/1), `createdAt`, `formationDate`.*

| № | Метод | URL | Описание | Входные данные | Выходные данные |
|---|---|---|---|---|---|
| **Домен услуги** |
| 1 | GET | `/api/construction` | Получение списка опубликованных проектов с фильтрацией. | Query-параметры: `minPrice` (число), `maxPrice` (число) | Массив объектов `ConstructionResponseDto` |
| 2 | GET | `/api/construction/feed` | Получение одной карточки для ленты с возможностью перелистывания. | Query-параметры: `id` (число, опционально), `next` (boolean, опционально) | `ConstructionResponseDto` |
| 3 | GET | `/api/construction/draft` | Получение текущего черновика пользователя. | Нет | `ConstructionResponseDto` или `null` |
| 4 | POST | `/api/construction` | Добавление нового черновика вместе с медиафайлами. | Body (form-data): `title` (строка), `description`, `price`, `area` (опц.), файлы `image`, `video` | `ConstructionResponseDto` (201 Created) |
| 5 | PUT | `/api/construction/{id}/publish` | Перевод черновика в статус "опубликован" и заполнение полей. | URL: `id`. Body (JSON): `title`, `description`, `price`, `area` (все опционально) | `ConstructionResponseDto` |
| 6 | DELETE | `/api/construction/{id}` | Логическое удаление (soft delete) проекта текущим создателем. | URL: `id`. | Статус 204 No Content |
| 7 | POST | `/api/construction/{id}/like` | Проставление (1) или удаление (0) лайка. | URL: `id`. Body (JSON): `action` (0 или 1) | Статус 204 No Content |
| **Домен пользователь** |
| 8 | POST | `/api/users/register` | Регистрация нового пользователя. | Body (JSON): `username` (строка), `password` (строка) | Статус 201 Created |
| 9 | POST | `/api/users/login` | Аутентификация пользователя (заглушка для 4 лабы). | Нет | Статус 200 OK |
| 10 | POST | `/api/users/logout` | Деавторизация пользователя (заглушка для 4 лабы). | Нет | Статус 204 No Content |