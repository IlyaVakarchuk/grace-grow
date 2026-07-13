# Grace 🌱

Мониторинг домашних растений, овощей и специй.

## Стек

- **Mobile:** React Native (Expo) + TypeScript
- **API:** Go (chi, pgx, JWT)
- **DB:** PostgreSQL

## Быстрый старт

### 1. PostgreSQL

```bash
docker compose up -d
```

### 2. API

```bash
cd api
cp ../.env.example ../.env   # или export переменные
go run ./cmd/server
```

Сервер: `http://localhost:8080`

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Для Android-эмулятора API доступен на `10.0.2.2:8080` (настроено автоматически).

## API endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход |
| GET | `/api/v1/me` | Текущий пользователь |
| GET/POST | `/api/v1/plants` | Список / создание |
| GET/PUT/DELETE | `/api/v1/plants/{id}` | CRUD растения |
| GET/POST | `/api/v1/plants/{id}/care-logs` | Журнал ухода |
| GET/POST | `/api/v1/plants/{id}/reminders` | Напоминания |
| GET | `/api/v1/reminders/upcoming` | Ближайшие напоминания |

## Структура

```
grace/
├── api/              # Go backend
├── db/migrations/    # SQL миграции
├── mobile/           # Expo app
└── docker-compose.yml
```

## Следующие шаги

- [ ] Push-уведомления (Expo Notifications)
- [ ] Загрузка фото растений
- [ ] Справочник видов (томат, базилик, мята)
- [ ] Календарь напоминаний
- [ ] IoT-датчики (влажность почвы)
