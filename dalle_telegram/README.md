# DALL-E + Telegram Pipeline

Автоматическая генерация изображений через DALL-E 3 и публикация в Telegram.

---

## Быстрый старт (5 шагов)

### Шаг 1 — Установи Python зависимости

```bash
pip install -r requirements.txt
```

### Шаг 2 — Создай файл `.env`

```bash
cp .env.example .env
```

Открой `.env` и заполни три значения:

```
OPENAI_API_KEY=sk-proj-...
TELEGRAM_BOT_TOKEN=1234567890:AAH...
TELEGRAM_CHAT_ID=-1001234567890
```

#### Как получить ключи:

**OpenAI API Key:**
1. Зайди на https://platform.openai.com/api-keys
2. Нажми `Create new secret key`
3. Скопируй — показывается только один раз

**Telegram Bot Token:**
1. Открой Telegram, найди `@BotFather`
2. Напиши `/newbot`
3. Введи название и username бота
4. Скопируй токен из ответа

**Telegram Chat ID:**
1. Создай канал или группу в Telegram
2. Добавь своего бота как **администратора**
3. Напиши `@userinfobot` в этот чат — он вернёт Chat ID
4. Для каналов ID начинается с `-100`

### Шаг 3 — Проверь подключения

```bash
python check_connections.py
```

Должно вывести три зелёных галочки. Если нет — проверь ключи в `.env`.

### Шаг 4 — Первый запуск

```bash
python pipeline.py
```

Это сгенерирует одно изображение и отправит в Telegram. Занимает ~15 секунд.

### Шаг 5 — Автоматический режим

Отредактируй свои посты в `scheduler.py` → список `POSTS`.

```bash
python scheduler.py
```

Планировщик работает по расписанию: Пн 10:00 · Ср 12:00 · Пт 09:00.

---

## Структура проекта

```
dalle_telegram/
├── pipeline.py          ← основной пайплайн (генерация + отправка)
├── scheduler.py         ← планировщик с контент-планом
├── check_connections.py ← проверка API перед запуском
├── requirements.txt     ← зависимости Python
├── .env.example         ← шаблон конфигурации
└── .env                 ← твои ключи (не добавляй в git!)
```

---

## Настройка постов

В файле `scheduler.py` отредактируй список `POSTS`:

```python
POSTS = [
    {
        "prompt": "Описание изображения для DALL-E на английском...",
        "caption": "Текст поста на любом языке #хэштег",
    },
    # добавляй сколько угодно...
]
```

**Советы для DALL-E промптов:**
- Пиши на английском — качество выше
- Всегда добавляй `no text, no watermarks` в конец
- Указывай стиль: `photorealistic`, `editorial`, `minimalist`, etc.
- Указывай освещение: `golden hour`, `studio lighting`, `cinematic`

---

## Следующий шаг

Когда локальный запуск работает — деплой на Railway.app:
1. Загрузи проект на GitHub
2. Подключи репозиторий на railway.app
3. Добавь переменные окружения в настройках Railway
4. Пайплайн работает 24/7 без твоего компьютера
