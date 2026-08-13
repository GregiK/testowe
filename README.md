# testowe

Minimalna aplikacja Node.js (Express) — starter przygotowany do wdrożenia
na Aderlo Cloud jako "Aplikacja Node.js".

## Uruchomienie lokalne

```bash
npm install
npm start
```

Aplikacja wystartuje na porcie z zmiennej środowiskowej `PORT` (domyślnie 3000).

## Wdrożenie na GitHub

```bash
git init
git add .
git commit -m "Initial commit: Node.js starter"
git branch -M main
git remote add origin https://github.com/GregiK/testowe.git
git push -u origin main
```

## Konfiguracja w Aderlo Cloud

- Plik startowy: `server.js`
- Komenda startu: `npm start`
- Port: aplikacja czyta port ze zmiennej środowiskowej `PORT` — hosting sam ją ustawia
