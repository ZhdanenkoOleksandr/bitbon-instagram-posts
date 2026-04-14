# ✅ Чеклист Instagram Auto-Poster

## 🎯 Шаг 1: Получение Credentials (5-10 минут)

### Instagram Access Token
- [ ] Перейти на https://developers.facebook.com
- [ ] Создать App (тип: Business)
- [ ] Добавить Instagram Graph API
- [ ] Сгенерировать Long-lived User Access Token
- [ ] Скопировать Access Token в безопасное место
- [ ] Получить ваш Instagram Business Account ID

### Image Generation API (выберите один)

**DALL-E (OpenAI)** - самый лучший результат
- [ ] Зарегистрироваться на https://platform.openai.com
- [ ] Перейти Settings → API Keys
- [ ] Create new secret key
- [ ] Скопировать API Key

**Stability AI** - дешевле
- [ ] Зарегистрироваться на https://stability.ai
- [ ] Получить API Key в аккаунте
- [ ] Скопировать API Key

**Replicate** - самый дешёвый
- [ ] Зарегистрироваться на https://replicate.com
- [ ] Создать API Token
- [ ] Скопировать Token

---

## 🚀 Шаг 2: Выбор способа запуска

### Вариант A: GitHub Actions ⭐ РЕКОМЕНДУЕТСЯ

- [ ] Залогиниться в GitHub
- [ ] Перейти в Settings репозитория
- [ ] Secrets and variables → Actions
- [ ] Создать новый Secret для каждого параметра:

| Имя Secret | Значение |
|-----------|----------|
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | ваш_id |
| `INSTAGRAM_ACCESS_TOKEN` | ваш_token |
| `IMAGE_PROVIDER` | openai (или stability/replicate) |
| `IMAGE_API_KEY` | ваш_api_ключ |
| `IMAGE_MODEL` | dall-e-3 |

- [ ] Workflow готов! Включен в `.github/workflows/instagram-poster.yml`
- [ ] Переходим к тестированию (Шаг 3)

### Вариант B: Локальный Node.js Сервис

- [ ] Установить Node.js 16+ (если не установлен)
- [ ] Открыть терминал в папке проекта
- [ ] Выполнить: `cd src/instagram-auto-poster && npm install`
- [ ] Скопировать `.env.template` в `.env`: `cp .env.template .env`
- [ ] Отредактировать `.env` и добавить credentials:
  ```env
  INSTAGRAM_BUSINESS_ACCOUNT_ID=ваш_id
  INSTAGRAM_ACCESS_TOKEN=ваш_token
  IMAGE_PROVIDER=openai
  IMAGE_API_KEY=ваш_ключ
  TIMEZONE=Europe/Moscow
  ```
- [ ] Переходим к тестированию (Шаг 3)

---

## 🧪 Шаг 3: Тестирование

### Для GitHub Actions:

- [ ] Перейти на вкладку Actions
- [ ] Выбрать workflow "Instagram Auto-Poster"
- [ ] Нажать "Run workflow"
- [ ] Подождать завершения
- [ ] Проверить лог на ошибки

### Для локального запуска:

```bash
cd src/instagram-auto-poster
npm run post-now
```

Результаты:
- ✅ Если успех: проверьте свой Instagram!
- ❌ Если ошибка: проверьте `logs/instagram-poster.log`

- [ ] Первый пост успешно опубликован!

---

## ⚙️ Шаг 4: Включение автоматизации

### Для GitHub Actions:
- [ ] Workflow уже включён!
- [ ] Посты будут публиковаться автоматически в 9 AM по московскому времени
- [ ] Можно отредактировать время в `.github/workflows/instagram-poster.yml` если нужно

### Для локального сервиса на macOS/Linux:

**Вариант 1: systemd (на Linux)**
```bash
sudo nano /etc/systemd/system/instagram-poster.service
```
Вставить:
```ini
[Unit]
Description=Instagram Auto Poster
After=network.target

[Service]
Type=simple
WorkingDirectory=/полный/путь/к/Cloude Code/src/instagram-auto-poster
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Запустить:
```bash
sudo systemctl enable instagram-poster
sudo systemctl start instagram-poster
```

- [ ] Сервис запущен и будет автозагружаться

**Вариант 2: LaunchAgent (на macOS)**
```bash
cat > ~/Library/LaunchAgents/com.instagram.poster.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.instagram.poster</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/полный/путь/к/index.js</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>86400</integer>
</dict>
</plist>
EOF
```

- [ ] LaunchAgent установлен

---

## 📊 Шаг 5: Мониторинг

- [ ] Проверить статус постов:
  ```bash
  cat src/instagram-auto-poster/data/posted.json
  ```

- [ ] Просмотреть логи:
  ```bash
  tail -20 src/instagram-auto-poster/logs/instagram-poster.log
  ```

- [ ] Подписаться на уведомления GitHub Actions
  - Перейти в Settings → Notifications
  - Включить "Send notifications for failed workflow runs"

---

## 🛠️ Дополнительно

### Изменить время постинга

Отредактируйте в файлах:
- GitHub Actions: `.github/workflows/instagram-poster.yml` (строка `cron: '0 6 * * *'`)
- Node.js: `.env` параметр `CRON_TIME` (по умолчанию `0 9 * * *`)

### Изменить порядок постов

В `config.js` измените:
```javascript
randomOrder: true  // false = по очереди, true = случайный порядок
```

### Пакетная генерация всех изображений

```bash
cd src/instagram-auto-poster
npm run generate-images
```

---

## ✅ Финальная Проверка

- [ ] GitHub Secrets настроены (если используете GitHub Actions)
- [ ] `.env` файл создан и заполнен (если локальный запуск)
- [ ] `.env` файл в `.gitignore` (не коммитить!)
- [ ] Первый пост успешно опубликован
- [ ] Логи доступны и не показывают ошибок
- [ ] Расписание правильно настроено

---

## 🎉 Готово!

Ваш Instagram Auto-Poster полностью настроен и работает! 🚀

### Следующие шаги:
- Добавляйте новые посты в `instaposting/instagram_posts_content.json`
- Добавляйте промпты для изображений в `instaposting/image_prompts.json`
- Мониторьте логи и метрики
- Обновляйте контент регулярно

**Вопросы?** Проверьте `docs/INSTAGRAM_SETUP.md` для подробной документации.

---

**Всё готово к запуску! 🎊**
