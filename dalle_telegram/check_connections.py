"""
Проверка подключений к API
===========================
Запусти ПЕРЕД pipeline.py чтобы убедиться, что все ключи работают.
Запуск: python check_connections.py
"""

import os
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

print("\n🔍 Проверка подключений...\n")
all_ok = True


# ── 1. OpenAI ────────────────────────────────────────────────────────────────
print("1. OpenAI API...", end=" ")
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    models = client.models.list()
    dalle_available = any("dall-e" in m.id for m in models.data)
    if dalle_available:
        print("✅ Подключено · DALL-E доступен")
    else:
        print("⚠️  Подключено, но DALL-E не найден")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    all_ok = False


# ── 2. Telegram Bot ──────────────────────────────────────────────────────────
print("2. Telegram Bot...", end=" ")
try:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    r = requests.get(
        f"https://api.telegram.org/bot{token}/getMe",
        timeout=10
    )
    if r.status_code == 200:
        bot_name = r.json()["result"]["username"]
        print(f"✅ Подключено · @{bot_name}")
    else:
        print(f"❌ Ошибка: {r.json().get('description', r.status_code)}")
        all_ok = False
except Exception as e:
    print(f"❌ Ошибка: {e}")
    all_ok = False


# ── 3. Telegram Chat ID ──────────────────────────────────────────────────────
print("3. Telegram Chat ID...", end=" ")
try:
    token   = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    r = requests.get(
        f"https://api.telegram.org/bot{token}/getChat",
        params={"chat_id": chat_id},
        timeout=10
    )
    if r.status_code == 200:
        chat = r.json()["result"]
        name = chat.get("title") or chat.get("username") or chat_id
        print(f"✅ Найден · {name}")
    else:
        print(f"❌ Чат не найден: {r.json().get('description')}")
        print("   → Убедись что бот добавлен в канал/группу как администратор")
        all_ok = False
except Exception as e:
    print(f"❌ Ошибка: {e}")
    all_ok = False


# ── Итог ─────────────────────────────────────────────────────────────────────
print()
if all_ok:
    print("✅ Все подключения работают. Можно запускать pipeline.py\n")
else:
    print("❌ Исправь ошибки выше, затем повтори проверку.\n")
    print("   Инструкции в файле .env.example\n")
