"""
Планировщик автопостинга
========================
Запускает pipeline.py по расписанию.
Запуск: python scheduler.py
"""

import schedule
import time
from datetime import datetime
from dalle_telegram.pipeline import run_pipeline


# ── Контент-план ──────────────────────────────────────────────────────────────
# Добавляй сюда свои посты. Планировщик будет брать их по очереди.

POSTS = [
    {
        "prompt": """
            Abstract digital art representing collective intelligence and trust —
            flowing data streams merging into a singular glowing point of light,
            deep space background, teal and gold tones, no text.
        """,
        "caption": (
            "Коллективный интеллект рождается там, где люди "
            "доверяют друг другу.\n\n"
            "Web 4.0 — это не протокол. Это культура.\n\n"
            "#Web4 #CollectiveIntelligence #DigitalCulture"
        ),
    },
    {
        "prompt": """
            Minimalist geometric composition — clean white and deep navy shapes
            forming a symbolic transparent network graph, Swiss design aesthetic,
            generous white space, no text, no watermarks.
        """,
        "caption": (
            "Прозрачность — это не слабость. Это конкурентное преимущество.\n\n"
            "Когда партнёры видят всё — растёт доверие, а с ним и результат.\n\n"
            "#Transparency #DigitalReputation #Web4Vision"
        ),
    },
    {
        "prompt": """
            Organic root system morphing into a glowing digital network —
            nature meets technology, warm earth tones, photorealistic macro style,
            cinematic lighting, no text.
        """,
        "caption": (
            "Устойчивые системы растут как деревья — медленно, "
            "глубоко, надёжно.\n\n"
            "Мы строим именно такие.\n\n"
            "#SustainableGrowth #Web4 #StrategicThinking"
        ),
    },
]

post_index = 0  # счётчик для ротации постов


def scheduled_job():
    """Берёт следующий пост из очереди и запускает пайплайн."""
    global post_index
    post = POSTS[post_index % len(POSTS)]
    post_index += 1

    print(f"\n[Scheduler] 🔔 Запуск по расписанию · пост #{post_index}")
    run_pipeline(post["prompt"], post["caption"])


# ── Расписание ────────────────────────────────────────────────────────────────
# Редактируй время под себя (формат 24ч, UTC+2 если запускаешь локально)

schedule.every().monday.at("10:00").do(scheduled_job)
schedule.every().wednesday.at("12:00").do(scheduled_job)
schedule.every().friday.at("09:00").do(scheduled_job)

# Для теста — раскомментируй строку ниже (запуск каждые 2 минуты):
# schedule.every(2).minutes.do(scheduled_job)


# ── Запуск ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("═" * 50)
    print("  Планировщик запущен")
    print("  Расписание: Пн 10:00 · Ср 12:00 · Пт 09:00")
    print(f"  Постов в очереди: {len(POSTS)}")
    print("═" * 50)

    # Запустить сразу при старте (раскомментируй для теста):
    # scheduled_job()

    while True:
        schedule.run_pending()
        next_run = schedule.next_run()
        print(f"\r  Следующий запуск: {next_run.strftime('%Y-%m-%d %H:%M')}  ", end="")
        time.sleep(30)
