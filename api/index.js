const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let posts = [
  {
    id: 1,
    title: "Добро пожаловать в неоновый блог!",
    badge: "ГЛАВНОЕ",
    summary: "Это первый демонстрационный пост на нашем ультрасовременном сайте.",
    content: "Здесь находится полное содержимое поста. Дизайн выполнен в светлых неоновых тонах, которые радуют глаз и создают ощущение технологий будущего! Вы можете нажимать на реакции и крутить счетчик просмотров.",
    views: 124,
    reactions: { "🔥": 12, "❤️": 8, "🚀": 5 }
  },
  {
    id: 2,
    title: "Важное обновление системы",
    badge: "СРОЧНОЕ",
    summary: "Мы запустили серверless-скрипт прямо на платформе Vercel.",
    content: "Полный текст срочной новости: Теперь проект работает на базе Express.js и адаптирован под ограничения облачных функций. Всё летает!",
    views: 45,
    reactions: { "🔥": 2, "❤️": 4, "🚀": 1 }
  }
];

function getBadgeClass(badge) {
  if (badge === 'СРОЧНОЕ') return 'red';
  if (badge === 'ГЛАВНОЕ') return 'blue';
  return 'green';
}

app.get('/', (req, res) => {
  let postsHtml = posts.map(post => `
    <div class="post-card" onclick="window.location.href='/post/${post.id}'">
      <div class="post-header">
        <span class="badge badge-${getBadgeClass(post.badge)}">${post.badge}</span>
        <span class="views-count">👁️ ${post.views}</span>
      </div>
      <h2 class="post-title">${post.title}</h2>
      <p class="post-summary">${post.summary}</p>
      <div class="reactions-bar">
        ${Object.keys(post.reactions).map(emoji => `
          <button class="reaction-btn" onclick="event.stopPropagation(); sendReaction(${post.id}, '${emoji}', this)">
            ${emoji} <span>${post.reactions[emoji]}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  res.send(getLayout("Главная страница", `
    <h1 class="main-title">✨ Неоновая Лента Постов</h1>
    <div class="posts-container">${postsHtml}</div>
    <div class="admin-panel">
      <h3>➕ Панель автора: Создать новый пост</h3>
      <form action="/admin/add-post" method="POST">
        <input type="text" name="title" placeholder="Заголовок поста" required>
        <input type="text" name="summary" placeholder="Краткое описание (для ленты)" required>
        <textarea name="content" placeholder="Полное содержимое поста" rows="5" required></textarea>
        <label for="badge" style="display:block; margin-top:10px; font-weight:600;">Выберите значок:</label>
        <select name="badge" id="badge">
          <option value="НОВОЕ">НОВОЕ (Зеленый неон)</option>
          <option value="СРОЧНОЕ">СРОЧНОЕ (Красный неон)</option>
          <option value="ГЛАВНОЕ">ГЛАВНОЕ (Синий неон)</option>
        </select>
        <button type="submit">Опубликовать пост</button>
      </form>
    </div>
  `));
});

app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).send(getLayout("404", "<h1>Пост не найден</h1><a href='/'>На главную</a>"));
  post.views += 1;
  res.send(getLayout(post.title, `
    <div class="full-post">
      <a href="/" class="back-link">← Назад в ленту</a>
      <div class="post-header" style="margin-top: 20px;">
        <span class="badge badge-${getBadgeClass(post.badge)}">${post.badge}</span>
        <span class="views-count">👁️ Реальных просмотров: ${post.views}</span>
      </div>
      <h1 class="full-title">${post.title}</h1>
      <div class="full-content">${post.content}</div>
      <div class="big-reactions">
        <h3 style="margin-bottom:10px;">Оцените пост:</h3>
        <div class="reactions-bar">
          ${Object.keys(post.reactions).map(emoji => `
            <button class="reaction-btn" style="font-size:1.1rem; padding:10px 20px;" onclick="sendReaction(${post.id}, '${emoji}', this)">
              ${emoji} <span>${post.reactions[emoji]}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `));
});

app.post('/api/react', (req, res) => {
  const { id, emoji } = req.body;
  const post = posts.find(p => p.id === parseInt(id));
  if (post && post.reactions[emoji] !== undefined) {
    post.reactions[emoji] += 1;
    return res.json({ success: true, count: post.reactions[emoji] });
  }
  res.json({ success: false });
});

app.post('/admin/add-post', (req, res) => {
  const { title, summary, content, badge } = req.body;
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  posts.unshift({ id: newId, title, badge, summary, content, views: 0, reactions: { "🔥": 0, "❤️": 0, "🚀": 0 } });
  res.redirect('/');
});
function getLayout(title, bodyContent) {
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="preconnect" href="https://googleapis.com">
      <link rel="preconnect" href="https://gstatic.com" crossorigin>
      <link href="https://googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #f8fafc;
          --card-bg: #ffffff;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --neon-blue: #00f0ff;
          --neon-blue-glow: rgba(0, 240, 255, 0.25);
          --neon-pink: #ff007f;
          --neon-red: #ff3131;
        }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-color); color: var(--text-main); margin: 0; padding: 15px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 650px; }
        .main-title { font-weight: 800; font-size: 2.2rem; text-align: center; background: linear-gradient(45deg, #00b4d8, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 30px; }
        .post-card { background: var(--card-bg); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 240, 255, 0.15); transition: all 0.25s ease; cursor: pointer; }
        .post-card:hover { transform: translateY(-2px); border-color: var(--neon-blue); box-shadow: 0 8px 20px var(--neon-blue-glow); }
        .post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .badge { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
        .badge-green { color: #16a34a; background: rgba(22, 163, 74, 0.1); border: 1px solid #16a34a; box-shadow: 0 0 8px rgba(22, 163, 74, 0.2); }
        .badge-red { color: var(--neon-red); background: rgba(255, 49, 49, 0.1); border: 1px solid var(--neon-red); box-shadow: 0 0 8px rgba(255, 49, 49, 0.2); }
        .badge-blue { color: #0284c7; background: rgba(2, 132, 199, 0.1); border: 1px solid #0284c7; box-shadow: 0 0 8px rgba(2, 132, 199, 0.2); }
        .views-count { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .post-title { margin: 0 0 8px 0; font-size: 1.3rem; font-weight: 800; }
        .post-summary { color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; font-size: 0.95rem; }
        .reactions-bar { display: flex; gap: 8px; }
        .reaction-btn { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 30px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 4px; font-family: inherit; transition: all 0.2s; }
        .reaction-btn:hover { background: #fff; border-color: var(--neon-pink); box-shadow: 0 0 8px rgba(255, 0, 127, 0.25); }
        .full-post { background: white; padding: 25px; border-radius: 20px; border: 1px solid rgba(0, 240, 255, 0.15); }
        .back-link { text-decoration: none; color: var(--neon-pink); font-weight: 600; font-size: 0.95rem; }
        .full-title { font-size: 1.8rem; font-weight: 800; margin: 15px 0; }
        .full-content { font-size: 1.05rem; line-height: 1.7; color: #334155; white-space: pre-wrap; }
        .big-reactions { margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .admin-panel { margin-top: 40px; background: #fff; padding: 20px; border-radius: 16px; border: 2px dashed #00b4d8; }
        .admin-panel input, .admin-panel textarea, .admin-panel select, .admin-panel button { width: 100%; padding: 10px; margin-top: 8px; border-radius: 8px; border: 1px solid #cbd5e1; box-sizing: border-box; font-family: inherit; }
        .admin-panel button { background: linear-gradient(90deg, #00f0ff, #ff007f); color: white; font-weight: 700; border: none; cursor: pointer; margin-top: 15px; text-transform: uppercase; }
        .admin-panel button:hover { box-shadow: 0 0 12px rgba(255, 0, 127, 0.4); }
      </style>
      <script>
        async function sendReaction(postId, emoji, buttonElement) {
          try {
            const res = await fetch('/api/react', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: postId, emoji: emoji })
            });
            const data = await res.json();
            if(data.success) {
              const span = buttonElement.querySelector('span');
              if(span) span.innerText = data.count;
            }
          } catch(e) { console.error(e); }
        }
      </script>
    </head>
    <body>
      <div class="container">${bodyContent}</div>
    </body>
    </html>
  `;
}

module.exports = app;
