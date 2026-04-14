"""
Hugging Face + Telegram Auto-Post Pipeline
==========================================
Генерирует изображение через Hugging Face (бесплатно)
и отправляет в Telegram.
Запуск: python3 pipeline.py
"""

import os
import sys
import time
import requests
import io
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

HF_API_TOKEN     = os.getenv("HF_API_TOKEN")
TELEGRAM_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"


# ── Hugging Face: генерация изображения ──────────────────────────────────────
def generate_image(prompt: str) -> bytes:
    print(f"[HuggingFace] Генерирую изображение...")
    print(f"[HuggingFace] Prompt: {prompt[:80]}...")

    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "width": 1024,
            "height": 1024,
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
        }
    }

    for attempt in range(3):
        response = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=120)

        if response.status_code == 200:
            print(f"[HuggingFace] ✅ Изображение готово ({len(response.content) // 1024} KB)")
            return response.content

        elif response.status_code == 503:
            wait_time = 30
            print(f"[HuggingFace] Модель прогревается, жду {wait_time}с... (попытка {attempt + 1}/3)")
            time.sleep(wait_time)

        else:
            raise Exception(f"HF API error {response.status_code}: {response.text}")

    raise Exception("Модель не ответила после 3 попыток")


# ── Telegram: отправка изображения с подписью ────────────────────────────────
def send_to_telegram(image_bytes: bytes, caption: str) -> bool:
    print(f"[Telegram] Отправляю в чат {TELEGRAM_CHAT_ID}...")

    url   = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"
    files = {"photo": ("image.jpg", io.BytesIO(image_bytes), "image/jpeg")}
    data  = {
        "chat_id"    : TELEGRAM_CHAT_ID,
        "caption"    : caption,
        "parse_mode" : "HTML",
    }

    response = requests.post(url, files=files, data=data, timeout=60)

    if response.status_code == 200:
        msg_id = response.json()["result"]["message_id"]
        print(f"[Telegram] ✅ Отправлено · message_id: {msg_id}")
        return True
    else:
        print(f"[Telegram] ❌ Ошибка: {response.status_code} — {response.text}")
        return False


# ── Telegram: уведомление об ошибке ─────────────────────────────────────────
def send_error_alert(error_text: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id"    : TELEGRAM_CHAT_ID,
        "text"       : f"❌ <b>Pipeline error</b>\n\n{error_text}\n\n🕐 {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "parse_mode" : "HTML",
    }
    requests.post(url, data=payload, timeout=15)


# ── Основной пайплайн ────────────────────────────────────────────────────────
def run_pipeline(image_prompt: str, caption: str):
    print("\n" + "═" * 50)
    print(f"  Запуск пайплайна · {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("═" * 50)

    try:
        image_bytes = generate_image(image_prompt)
        success = send_to_telegram(image_bytes, caption)

        if success:
            print("\n✅ Пайплайн завершён успешно")
        else:
            print("\n⚠️  Изображение создано, но отправка не удалась")
            send_error_alert("Не удалось отправить изображение в Telegram.")

    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Ошибка пайплайна: {error_msg}")
        send_error_alert(f"Исключение в pipeline.py:\n<code>{error_msg}</code>")
        sys.exit(1)


# ── Точка входа ──────────────────────────────────────────────────────────────
if __name__ == "__main__":

    IMAGE_PROMPT = (
        "A futuristic AI-powered workspace, glowing neural network "
        "visualization floating above a sleek desk, soft blue and purple "
        "ambient light, ultra-realistic, cinematic depth of field, "
        "4K editorial style, no text, no watermarks"
    )

    CAPTION = (
        "Искусственный интеллект — это не угроза, это инструмент.\n\n"
        "Те, кто научится работать с AI сегодня, будут задавать правила "
        "игры завтра. Скорость, точность, масштаб — всё это уже доступно.\n\n"
        "Вопрос только один: ты используешь эти возможности?\n\n"
        "#AI #ArtificialIntelligence #FutureOfWork #Технологии"
    )

    run_pipeline(IMAGE_PROMPT, CAPTION)
