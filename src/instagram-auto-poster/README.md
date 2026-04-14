# Instagram Auto-Poster

Автоматический постинг в Instagram с генерацией изображений через AI. 🚀

## 🚀 Быстрый Старт (2 минуты)

### GitHub Actions (рекомендуется)

1. Добавьте secrets в Settings → Secrets:
   ```
   INSTAGRAM_BUSINESS_ACCOUNT_ID
   INSTAGRAM_ACCESS_TOKEN
   IMAGE_PROVIDER (openai, stability, replicate)
   IMAGE_API_KEY
   IMAGE_MODEL
   ```

2. Workflow уже готов в `.github/workflows/instagram-poster.yml`

3. Посты будут постить каждый день в 9 AM 🎉

### Локальный запуск

```bash
# Установка
npm install

# Конфигурация
cp .env.template .env
# Отредактируйте .env с вашими данными

# Пост сейчас (для тестирования)
npm run post-now

# Постоянный сервис (запосит в 9 AM каждый день)
npm start
```

---

## 📁 Структура

| Файл | Описание |
|------|---------|
| `index.js` | Основной сервис с cron расписанием |
| `instagram-poster.js` | Логика постинга в Instagram |
| `image-generator.js` | Генерация изображений через AI API |
| `config.js` | Конфигурация (загружает .env) |
| `logger.js` | Логирование в файл и консоль |
| `post-immediately.js` | Пост в момент запуска (для тестов) |
| `generate-images.js` | Пакетная генерация всех изображений |

---

## ⚙️ Конфигурация (.env)

```env
# Instagram
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
INSTAGRAM_ACCESS_TOKEN=your_token

# Image Generation
IMAGE_PROVIDER=openai          # openai, stability, replicate
IMAGE_API_KEY=your_key
IMAGE_MODEL=dall-e-3

# Расписание (cron format)
CRON_TIME=0 9 * * *            # 9 AM каждый день
TIMEZONE=Europe/Moscow         # Ваш часовой пояс

# Логирование
VERBOSE=false                  # true для отладки
```

---

## 📋 Команды

| Команда | Назначение |
|---------|-----------|
| `npm start` | Запустить сервис (будет постить в 9 AM) |
| `npm run post-now` | Пост сейчас (одноразово) |
| `npm run generate-images` | Сгенерировать все изображения |
| `npm run dev` | Разработка (с автозагрузкой) |

---

## 🎯 Поток работы

1. **Читает** посты из `../../instaposting/instagram_posts_content.json`
2. **Выбирает** пост (в случайном порядке или по очереди)
3. **Генерирует** изображение с помощью AI API
4. **Загружает** изображение в Instagram
5. **Публикует** пост с подписью и хештегами
6. **Логирует** результат в `data/posted.json`

---

## 📊 Логирование

Логи сохраняются в `logs/instagram-poster.log`

```bash
# Смотреть логи в реальном времени
tail -f logs/instagram-poster.log

# Последние 50 строк
tail -50 logs/instagram-poster.log

# Поиск ошибок
grep ERROR logs/instagram-poster.log
```

---

## 📈 Статус Постов

```bash
# Посмотреть какие посты уже опубликованы
cat data/posted.json
```

Формат:
```json
[
  {
    "postNumber": 1,
    "postedAt": "2024-04-13T09:00:00.000Z",
    "instagramPostId": "media_123456",
    "title": "Что такое Bitbon..."
  }
]
```

---

## 🔧 Поддерживаемые Image Providers

### OpenAI (DALL-E) - Лучшее качество
- Модели: `dall-e-3`, `dall-e-2`
- Цена: $0.04-0.08 за изображение
- Сайт: https://platform.openai.com

### Stability AI - Хороший баланс
- Модели: `stable-diffusion-xl-1024-v1-0`
- Цена: $0.03 за изображение
- Сайт: https://stability.ai

### Replicate - Самый дешёвый
- Модели: Stable Diffusion (различные)
- Цена: $0.01-0.02 за изображение
- Сайт: https://replicate.com

---

## 🐛 Отладка

### Проблема: "401 Unauthorized"
```bash
# Проверьте токен в .env
echo $INSTAGRAM_ACCESS_TOKEN

# Токен может быть истёкшим - получите новый на Facebook Developer
```

### Проблема: "Image generation failed"
```bash
# Проверьте API ключ
echo $IMAGE_API_KEY

# Проверьте баланс на аккаунте Image API
```

### Проблема: Ничего не постится в 9 AM
```bash
# Проверьте часовой пояс
echo $TIMEZONE

# Проверьте cron синтаксис
echo $CRON_TIME

# Если запускаете на сервере - проверьте времена сервера
date
```

---

## 🔐 Безопасность

⚠️ **ВАЖНО**
- ❌ Никогда не коммитьте `.env` файл!
- ✅ Используйте `.gitignore`
- ✅ Для GitHub Actions - используйте Secrets
- ✅ Ротируйте токены каждые 60 дней

```bash
# Проверьте .env не в git
git status | grep .env
```

---

## 📖 Документация

- **Полная инструкция**: `docs/INSTAGRAM_SETUP.md`
- **Чеклист настройки**: `INSTAGRAM_CHECKLIST.md`
- **Примеры стилей**: `../../instaposting/style_examples/`

---

## 🚀 Разворачивание на сервере

### Linux (systemd)

Создайте `/etc/systemd/system/instagram-poster.service`:

```ini
[Unit]
Description=Instagram Auto Poster
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/src/instagram-auto-poster
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
User=your_user

[Install]
WantedBy=multi-user.target
```

Запустите:
```bash
sudo systemctl enable instagram-poster
sudo systemctl start instagram-poster
sudo systemctl status instagram-poster
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .
RUN npm install

ENV NODE_ENV=production
CMD ["node", "index.js"]
```

```bash
docker build -t instagram-poster .
docker run -d --restart=always --env-file .env instagram-poster
```

---

## 💡 Советы

1. **Сгенерируйте изображения заранее**
   ```bash
   npm run generate-images
   ```

2. **Используйте GitHub Actions** - это самый надёжный способ

3. **Добавляйте новые посты** прямо в JSON файлы

4. **Тестируйте перед включением** автоматизации
   ```bash
   npm run post-now
   ```

5. **Мониторьте логи** регулярно
   ```bash
   tail -f logs/instagram-poster.log
   ```

---

## 📞 Поддержка

- 📝 Логи: `logs/instagram-poster.log`
- 📊 Статус: `data/posted.json`
- ⚙️ Конфиг: `config.js`
- 🔑 Credentials: `.env` (НЕ коммитить!)

---

**Готово к работе! 🎉**

Запустите `npm run post-now` для первого теста.
