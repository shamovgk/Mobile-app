# Word Rush Development Guide

## Первоначальная настройка

```bash
# клонирование
git clone https://github.com/shamovgk/word-rush
cd word-rush

# установка зависимостей backend
cd backend
npm install

# настройка переменных окружения
cp .env.example .env
# отредактируйте .env (обязательно: JWT_SECRET, DATABASE_URL)

# запуск базы данных
docker compose up -d

# применение миграций и генерация Prisma Client
npx prisma migrate dev --name init
npx prisma generate

# заполнение тестовыми данными
npx prisma db seed

# установка зависимостей frontend
cd ../frontend
npm install

# настройка frontend
cp .env.example .env
# укажите EXPO_PUBLIC_API_URL
```

## Ежедневная работа

### Запуск сервисов

```bash
# Терминал 1: backend
cd backend
npm run start:dev

# Терминал 2: frontend
cd frontend
npx expo start

# для iOS simulator
npx expo start --ios

# для Android emulator  
npx expo start --android

# очистка кеша
npx expo start -c
```

### Работа с docker

```bash
# запустить PostgreSQL
docker compose up -d

# остановить
docker compose down

# посмотреть логи
docker compose logs -f postgres

# полная очистка с данными
docker compose down -v

# перезапустить
docker compose restart
```

### Работа с базой данных

```bash
cd backend

# применить миграции
npx prisma migrate dev

# создать миграцию после изменения schema.prisma
npx prisma migrate dev --name add_new_field

# сгенерировать Prisma Client
npx prisma generate

# открыть Prisma Studio (GUI для БД)
npx prisma studio

# пересоздать БД с нуля (удалит все данные!)
npx prisma migrate reset

# заполнить данными
npx prisma db seed

# синхронизировать схему напрямую (только для dev)
npx prisma db push
```

### Подключение к базе данных

```bash
# через docker
docker compose exec postgres psql -U postgres -d wordrush

# локально (если установлен psql)
psql postgresql://postgres:password@localhost:5432/wordrush
```

Полезные SQL команды:
```sql
-- список таблиц
\dt

-- структура таблицы
\d users

-- выход
\q
```

## Переменные окружения

### backend (.env в backend/)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wordrush?schema=public
JWT_SECRET=<минимум-32-символа>
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

Сгенерировать JWT_SECRET:
```bash
openssl rand -base64 32
```

### frontend (.env в frontend/)

```env
# для iOS Simulator / локальная разработка
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# для Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# для физического устройства (замените на IP вашего компьютера)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

Узнать IP компьютера:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

## Отладка

### Проверка что все работает

```bash
# postgres доступен
docker compose exec postgres psql -U postgres -d wordrush -c "SELECT 1;"

# backend отвечает
curl http://localhost:3000/api

# проверка Prisma подключения
cd backend
node -e "require('@prisma/client').PrismaClient().user.findMany().then(console.log)"
```

### Частые проблемы

**Порты заняты:**
```bash
# найти процесс на порту
lsof -i :5432  # postgres
lsof -i :3000  # backend

# убить процесс
kill -9 <PID>
```

**Docker не запущен:**
```bash
# запустите Docker Desktop вручную
# затем проверьте
docker ps
```

**Prisma Client не сгенерирован:**
```bash
cd backend
npx prisma generate
```

**Network Error во frontend:**
```bash
# проверьте правильность EXPO_PUBLIC_API_URL в .env
# для iOS Simulator: http://localhost:3000/api
# для Android Emulator: http://10.0.2.2:3000/api
# для устройства: http://<ваш-IP>:3000/api

# очистите кеш Expo
npx expo start -c
```

**Миграции не применяются:**
```bash
# проверить подключение к БД
docker compose ps

# посмотреть логи postgres
docker compose logs postgres

# пересоздать базу
docker compose down -v
docker compose up -d
cd backend
npx prisma migrate dev
```

## Полезные линки

- backend api: http://localhost:3000/api
- prisma studio: `npx prisma studio` (из backend/)
- expo dev tools: запускается автоматически при `npx expo start`

## Git workflow

### Начало работы над задачей

```bash
# синхронизация с main
git checkout main
git pull origin main

# обновление зависимостей
npm install  # в backend и frontend если нужно

# создание ветки
git checkout -b feat/new-game-mode
git checkout -b fix/auth-bug
git checkout -b refactor/components-cleanup
```

### Работа в ветке

```bash
# коммиты по мере работы
git add .
git commit -m "feat: add new question type"

git add .
git commit -m "feat: update game logic for new type"

# push в remote
git push origin feat/new-game-mode
```

### Изменения схемы базы данных

```bash
# 1. изменяете schema.prisma
# 2. генерируете миграцию
cd backend
npx prisma migrate dev --name add_question_type

# 3. коммитим миграцию отдельно
git add prisma/migrations/
git commit -m "database: add question_type field to levels"

# 4. коммитим остальной код
git add .
git commit -m "feat: implement multiple question types"

# 5. push
git push origin feat/new-game-mode
```

### Синхронизация с main

```bash
# если параллельно были изменения в main
git checkout main
git pull origin main

git checkout feat/new-game-mode
git rebase main

# при конфликтах
# разрешаете конфликты в файлах
git add <файлы>
git rebase --continue

# альтернатива rebase
git merge main
```

### Pull Request

1. Создайте PR на GitHub
2. Заполните описание:
   - Что сделано
   - Зачем нужно
   - Как проверить
3. Дождитесь review
4. После approve: **Squash and merge**
5. Удалите ветку

### После мёржа

```bash
# обновление локального main
git checkout main
git pull origin main

# удаление старой ветки
git branch -d feat/new-game-mode
```

## Добавление нового пака

### 1. Создать JSON файл

Создайте `frontend/data/packs/pack-animals-1.json`:

```json
{
  "id": "pack-animals-1",
  "title": "Животные - базовый",
  "description": "Основные названия животных",
  "lang": "en",
  "cefr": "A1",
  "category": "animals",
  "levels": [
    {
      "levelNumber": 1,
      "difficulty": "easy",
      "lexemes": [
        {
          "form": "cat",
          "translation": "кошка",
          "transcription": "[kæt]",
          "examples": ["I have a cat"],
          "examplesPlural": ["cats"]
        }
      ]
    }
  ]
}
```

### 2. Запустить seed

```bash
cd backend
npx prisma db seed
```

## Соглашения о коммитах

Формат: `тип: описание`

**Типы:**
- `feat:` — новая функциональность
- `fix:` — исправление бага
- `refactor:` — рефакторинг без изменения функциональности
- `docs:` — изменения в документации
- `test:` — добавление тестов
- `database:` — изменения схемы БД

**Хорошие примеры:**
```
feat: add multiple choice question type
fix: resolve JWT token expiration bug
refactor: extract game logic to separate hooks
database: add achievements table
docs: update API documentation
```

**Плохие примеры:**
```
update
fix
changes
wip
```

## Полезные команды

```bash
# проверка TypeScript без компиляции
npx tsc --noEmit

# просмотр всех веток
git branch -a

# удаление старых локальных веток
git fetch --prune
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D

# временно спрятать изменения
git stash
git stash pop

# история коммитов
git log --oneline --graph --all

# информация о файле (кто менял)
git blame <файл>
```

---

## Что нужно установить

### 1. Node.js 18+

**Windows:**
```powershell
winget install OpenJS.NodeJS
```

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs
```

### 2. Docker Desktop

Скачать и установить:
- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/desktop/install/linux-install/

Проверка:
```bash
docker --version
docker compose version
```

### 3. Git

```bash
# macOS
brew install git

# Windows
winget install Git.Git

# Linux
sudo apt install git  # Debian/Ubuntu
sudo dnf install git  # Fedora
```

### 4. Expo Go (на телефоне)

- **iOS**: App Store → "Expo Go"
- **Android**: Google Play → "Expo Go"

## Клонирование репозитория

```bash
git clone https://github.com/shamovgk/word-rush
cd word-rush
```

## Запуск базы данных

Запустите:
```bash
cd backend
docker compose up -d
```

## Настройка переменных окружения

### Backend

Создайте `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wordrush?schema=public
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

Сгенерировать `JWT_SECRET`:
```bash
openssl rand -base64 32
```

### Frontend

Создайте `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Установка зависимостей и миграции

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Frontend
cd ../frontend
npm install
```

## Запуск для разработки

**Терминал 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npx expo start
```

Отсканируйте QR-код в приложении Expo Go на телефоне.

## Troubleshooting

### База данных не подключается
```bash
# проверьте Docker
docker compose ps

# посмотрите логи
docker compose logs postgres
```

### Backend не запускается
```bash
# проверьте .env
# проверьте что Prisma Client сгенерирован
npx prisma generate
```

### Frontend не подключается к API
```bash
# проверьте EXPO_PUBLIC_API_URL
# для iOS Simulator: http://localhost:3000/api
# для Android Emulator: http://10.0.2.2:3000/api
# для физического устройства: http://<IP-компьютера>:3000/api

# очистите кеш
npx expo start -c
```

### Порты заняты
```bash
# найдите процесс
lsof -i :5432  # postgres
lsof -i :3000  # backend

# остановите
kill -9 <PID>
```

---

**Готово к разработке! 🚀**
