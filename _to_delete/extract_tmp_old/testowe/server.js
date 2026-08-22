// Własny entrypoint pod cPanel "Setup Node.js App" (Passenger) na Aderlo Cloud.
// Passenger wywołuje ten plik bezpośrednio przez node (nie przez `npm start`/`next start`),
// więc uruchamiamy serwer Next.js programowo. PORT jest wstrzykiwany przez Passenger.
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`> Iskra (aplikacja randkowa) gotowa na porcie ${port} [${dev ? "dev" : "production"}]`);
    });
  })
  .catch((err) => {
    console.error("Błąd startu serwera Next.js:", err);
    process.exit(1);
  });
