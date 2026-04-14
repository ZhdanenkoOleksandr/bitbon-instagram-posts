# Instagram Auto-Poster Setup Guide

Полная автоматизация постинга в Instagram с генерацией изображений 🚀

## 📋 Требования

- **Instagram Business Account** (настроен)
- **Instagram Graph API Access** (с токеном доступа)
- **Image Generation API** (DALL-E, Stability AI или Replicate)
- **Node.js 16+** (для локального запуска)

## 🚀 Быстрый старт

### Вариант 1: GitHub Actions (Полная Автоматизация) ⭐ РЕКОМЕНДУЕТСЯ

Это самый простой способ - всё работает на серверах GitHub бесплатно, без необходимости держать машину включённой.

#### Шаг 1: Добавьте Secrets в GitHub

1. Перейдите в ваш репозиторий
2. Settings → Secrets and variables → Actions → New repository secret
3. Добавьте следующие переменные:

```
INSTAGRAM_BUSINESS_ACCOUNT_ID = ваш_id_аккаунта
INSTAGRAM_ACCESS_TOKEN = ваш_access_token
IMAGE_PROVIDER = openai (или stability, replicate)
IMAGE_API_KEY = ваш_api_ключ_для_генерации
IMAGE_MODEL = dall-e-3
```

#### Шаг 2: Workflow уже готов!

GitHub Actions автоматически запустится в 9 утра по московскому времени каждый день.

Для тестирования:
- Перейдите на вкладку Actions
- Нажмите "Instagram Auto-Poster"
- Нажмите "Run workflow"

---

### Вариант 2: Локальный Node.js Сервис

Для запуска на вашей машине/сервере.

#### Шаг 1: Установка

```bash
cd src/instagram-auto-poster
npm install
```

#### Шаг 2: Конфигурация

Скопируйте шаблон и заполните ваши данные:

```bash
cp .env.template .env
```

Отредактируйте `.env`:

```env
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
INSTAGRAM_ACCESS_TOKEN=your_token
IMAGE_PROVIDER=openai
IMAGE_API_KEY=your_key
TIMEZONE=Europe/Moscow
```

#### Шаг 3: Запуск

Разовый пост (для тестирования):
```bash
npm run post-now
```

Постоянный сервис (постит каждый день в 9 утра):
```bash
npm start
```

#### Шаг 4: Как сделать Service (автозапуск на сервере)

**На Linux/macOS (systemd):**

Создайте файл `/etc/systemd/system/instagram-poster.service`:

```ini
[Unit]
Description=Instagram Auto Poster
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/Cloude\ Code/src/instagram-auto-poster
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Включите сервис:
```bash
sudo systemctl enable instagram-poster
sudo systemctl start instagram-poster
sudo systemctl status instagram-poster
```

---

## 🔑 Где получить Credentials?

### Instagram Access Token

1. Перейдите в [Meta App Dashboard](https://developers.facebook.com)
2. Создайте App (тип: Business)
3. Добавьте Instagram Graph API product
4. Сгенерируйте Long-lived User Access Token
5. Скопируйте Access Token

### Image Generation API

**Вариант 1: OpenAI (DALL-E)**
- Сайт: https://platform.openai.com
- Создайте API Key в Account Settings
- Стоимость: $0.04-$0.08 за изображение

**Вариант 2: Stability AI**
- Сайт: https://stability.ai
- Получите API Key
- Стоимость: от $0.03 за изображение

**Вариант 3: Replicate**
- Сайт: https://replicate.com
- Используйте модель Stable Diffusion
- Стоимость: дешевле, примерно $0.01

---

## 📝 Файловая Структура

```
instaposting/
├── instagram_posts_content.json    # Контент постов
├── image_prompts.json               # Промпты для генерации
├── instagram_metrics.json           # Метрики
├── instagram_posts_final.xlsx       # Финальные посты
├── style_examples/                  # Примеры стилей
│   ├── style_1_modern_tech.json
│   ├── style_2_financial.json
│   ├── style_3_cyber.json
│   └── style_4_web4.json
└── generated_images/                # Сгенерированные картинки

src/instagram-auto-poster/
├── index.js                         # Основной сервис
├── config.js                        # Конфигурация
├── instagram-poster.js              # Логика постинга
├── image-generator.js               # Генерация изображений
├── logger.js                        # Логирование
├── post-immediately.js              # Разовый пост
├── generate-images.js               # Пакетная генерация
├── .env                             # Переменные (НЕ коммитить!)
├── .env.template                    # Шаблон
├── package.json                     # Зависимости
├── data/posted.json                 # Логия опубликованных
└── logs/                            # Логи приложения
```

---

## 🧪 Тестирование

### Пост сейчас:
```bash
cd src/instagram-auto-poster
npm run post-now
```

### Сгенерировать все изображения:
```bash
npm run generate-images
```

### Проверить статус:
```bash
cat logs/instagram-poster.log
```

---

## 📊 Расписание

По умолчанию: **9 AM по московскому времени каждый день**

Для изменения отредактируйте `CRON_TIME` в `.env`:

```
Примеры cron:
"0 9 * * *"      = 9 AM каждый день
"0 9 * * 1-5"    = 9 AM в будни
"0 */6 * * *"    = Каждые 6 часов
"*/30 * * * *"   = Каждые 30 минут
```

---

## ⚙️ Параметры в config.js

| Параметр | Описание |
|----------|---------|
| `instagram.businessAccountId` | ID вашего бизнес-аккаунта |
| `instagram.accessToken` | Token для API |
| `imageGeneration.provider` | Сервис генерации (openai, stability, replicate) |
| `imageGeneration.apiKey` | API ключ генератора |
| `posting.cronTime` | Расписание в формате cron |
| `posting.timezone` | Часовой пояс |
| `posting.randomOrder` | Постить в случайном порядке (true/false) |

---

## 🔐 Безопасность

⚠️ **ВАЖНО:**
- ❌ Никогда не коммитьте `.env` файл!
- ✅ Используйте только GitHub Secrets для CI/CD
- ✅ Ротируйте токены каждые 60 дней
- ✅ Используйте разные API ключи для разных окружений

Проверка перед коммитом:
```bash
# Убедитесь, что .env не в git
git status | grep .env
```

---

## 🐛 Решение проблем

### Проблема: "401 Unauthorized"
**Решение:** Проверьте, что Access Token не истёк, и он имеет правильные permissions.

### Проблема: "Invalid image format"
**Решение:** Instagram требует квадратные изображения (1024x1024). Проверьте параметры в `image-generator.js`.

### Проблема: "Caption too long"
**Решение:** Instagram лимит 2200 символов. Код автоматически обрезает длинные подписи.

### Проблема: "Rate limited"
**Решение:** Добавьте задержку между постами или уменьшите частоту.

---

## 📈 Мониторинг

Логи сохраняются в `logs/instagram-poster.log`

Посмотреть последние события:
```bash
tail -f src/instagram-auto-poster/logs/instagram-poster.log
```

Статус опубликованных постов:
```bash
cat src/instagram-auto-poster/data/posted.json
```

---

## 🚀 Следующие Шаги

1. ✅ Создайте Instagram Business Account (уже готово)
2. ✅ Подготовьте контент в JSON (уже готово)
3. ✅ Добавьте примеры стилей (уже готово)
4. ⬜ Получите Credentials (Instagram + Image API)
5. ⬜ Добавьте Secrets в GitHub или создайте `.env`
6. ⬜ Запустите первый пост (`npm run post-now`)
7. ⬜ Включите GitHub Actions или Node.js сервис
8. ⬜ Мониторьте логи

---

## 💡 Советы

- Сгенерируйте все изображения заранее (`npm run generate-images`)
- Используйте GitHub Actions - это самый надёжный способ
- Добавьте webhook для уведомлений при ошибках
- Регулярно обновляйте контент в JSON файлах
- Используйте разные стили для разнообразия

---

## 📞 Support

Если что-то не работает, проверьте:
1. Логи: `logs/instagram-poster.log`
2. Credentials в `.env` или GitHub Secrets
3. Instagram API статус: https://status.fb.com
4. Image API статус

---

**Всё готово! 🎉 Теперь ваш контент будет публиковаться автоматически!**
