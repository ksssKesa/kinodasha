const path = require('path');
const fs   = require('fs');
const admin = require('firebase-admin');

// 1. Подключаем сервисный ключ
const serviceAccount = require('../credentials/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// если захочу игнорировать undefined на уровне клиента, можно раскомментировать:
// admin.firestore().settings({ ignoreUndefinedProperties: true });

const db = admin.firestore();

async function seedMovies() {
  // 2. Читаем JSON
  const filePath = path.join(__dirname, '../data/movies.json');
  let movies;
  try {
    movies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Не могу прочитать data/movies.json:', e);
    process.exit(1);
  }

  console.log(`Заливаем ${movies.length} фильмов…`);

  // 3. Удаляем старые документы
  const colRef = db.collection('movies');
  const oldDocs = await colRef.listDocuments();
  await Promise.all(oldDocs.map(d => d.delete()));
  console.log('Старая коллекция очищена.');

  // 4. Добавляем новые, фильтруя undefined
  let count = 0;
  for (const m of movies) {
    // Собираем объект, в котором убираем undefined-поля:
    const data = {};
    if (m.title       != null) data.title       = m.title;
    if (m.year        != null) data.year        = m.year;
    if (m.rating      != null) data.rating      = m.rating;
    if (Array.isArray(m.genre)) data.genre       = m.genre;
    if (m.poster      != null) data.poster      = m.poster;
    if (m.description != null) data.description = m.description;

    await colRef.add(data);
    count++;
    process.stdout.write(`  • ${count}/${movies.length}\r`);
  }

  console.log('\nСидирование завершено!');
  process.exit(0);
}

seedMovies().catch(err => {
  console.error('Ошибка при сидировании:', err);
  process.exit(1);
});