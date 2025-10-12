from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils import executor
import asyncio

BOT_TOKEN = "7895470939:AAEFSLYDEbfwWOY3P_j-vmYSsO1LNL8Z5Fk"
ADMIN_ID = 7351552004  # например 123456789

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

# Список одобренных пользователей (можно заменить на базу данных)
approved_users = set()


@dp.message_handler(lambda message: "🆕 Новый пользователь ввёл ID:" in message.text)
async def handle_new_user(message: types.Message):
    # Извлекаем ID из сообщения
    parts = message.text.split("ID: ")
    if len(parts) < 2:
        return
    user_id = parts[1].split("\n")[0]

    # Кнопки одобрить / отклонить
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_{user_id}")],
        [InlineKeyboardButton("❌ Отклонить", callback_data=f"decline_{user_id}")]
    ])

    await message.reply(f"Пользователь {user_id} хочет доступ к сигналам.", reply_markup=keyboard)


@dp.callback_query_handler(lambda c: c.data.startswith("approve_") or c.data.startswith("decline_"))
async def process_approval(callback: types.CallbackQuery):
    action, user_id = callback.data.split("_", 1)

    if action == "approve":
        approved_users.add(user_id)
        await callback.message.edit_text(f"✅ ID {user_id} одобрен!")
        # Отправим пользователю ссылку на страницу сигналов (если у него есть бот)
        try:
            await bot.send_message(user_id, "✅ Ваш ID одобрен! Перейдите на сайт для сигналов: https://твой-логин.github.io/pocket-signals-site/signals.html")
        except:
            pass
    else:
        await callback.message.edit_text(f"❌ ID {user_id} отклонён.")


@dp.message_handler(commands=["approved"])
async def list_approved(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return
    if not approved_users:
        await message.answer("Нет одобренных пользователей.")
    else:
        users = "\n".join(approved_users)
        await message.answer(f"✅ Одобренные ID:\n{users}")


if __name__ == "__main__":
    asyncio.run(dp.start_polling(bot))
