const express = require('express');
const app = express();

// Aderlo Cloud (i większość hostingów Node.js) przekazuje numer portu
// przez zmienną środowiskową PORT — nie wpisuj portu na sztywno.
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <title>testowe</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 640px; margin: 80px auto; padding: 0 20px; color: #1a1a1a; }
        h1 { font-size: 28px; }
        code { background: #f2f2f2; padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Działa 🚀</h1>
      <p>Aplikacja Node.js wystartowała poprawnie i jest gotowa do dalszej rozbudowy.</p>
      <p>Plik startowy: <code>server.js</code></p>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
