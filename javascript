import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./uids.json');

// Загружаем базу UID
function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath));
}

// Сохраняем базу UID
function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { uid, ref } = req.body;

    if (!uid || !ref) return res.status(400).json({ error: 'uid и ref обязательны' });

    const db = loadDB();
    if (!db[uid]) {
      db[uid] = { status: 'pending', ref };
      saveDB(db);
      // TODO: отправить уведомление администратору (Telegram)
      return res.json({ status: 'pending', message: 'UID сохранён, ожидайте одобрения' });
    } else {
      return res.json({ status: db[uid].status });
    }
  }

  res.status(405).json({ error: 'Метод не поддерживается' });
}
