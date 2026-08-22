# Plan: Iskra (robocza nazwa) - aplikacja randkowa

## Założenia
Patrz `docs/assumptions.md` - w skrócie: hosting Aderlo Cloud (cPanel, Passenger, MySQL,
bez Redis), MVP jako responsywna aplikacja web, rynek Polska/UE 18+, model freemium.

## Decyzje techniczne

| Obszar | Wybór | Uzasadnienie |
|---|---|---|
| Framework full-stack | Next.js (App Router, TS strict) zamiast osobnego frontend/backend | Monolit modularny wystarcza na tę skalę; jeden proces Node pasuje do modelu hostingu Passenger (jeden "Setup Node.js App") |
| Baza danych | MySQL + Prisma zamiast PostgreSQL | Hosting docelowy udostępnia wyłącznie MySQL (8 baz), brak PostgreSQL/PostGIS |
| Cache / rate limit / kolejki | Rate limiting w pamięci procesu, bez Redis | Redis wyłączony na koncie hostingowym; przy skalowaniu można włączyć Redis i przełączyć limiter |
| Realtime czat | Polling HTTP zamiast Socket.IO w MVP | Niepewne wsparcie długożyjących WebSocketów w Passenger na hostingu współdzielonym; do weryfikacji, potem można dodać Socket.IO |
| Autoryzacja | Sesje serwerowe (cookie HTTP-only + tabela `Session`, token haszowany SHA-256) | Nie wymaga Redis, łatwa rewokacja sesji, zgodne z zasadą "nie ufaj samemu tokenowi klienta" |
| Hasła | Argon2id | Rekomendowany domyślny algorytm w wytycznych bezpieczeństwa skilla |
| Pliki/zdjęcia | S3-compatible storage (dostawca do potwierdzenia) | cPanel shared hosting nie nadaje się do przechowywania dużych ilości plików binarnych w repo/dysku aplikacji |
| Wdrożenie | Własny `server.js` (Next.js programowo) + cPanel "Setup Node.js App" (Passenger) | Passenger wykonuje plik startowy bezpośrednio przez `node`, nie przez CLI `next start`; cPanel instaluje pełne `node_modules` przyciskiem "Run NPM Install", więc `output: "standalone"` jest niepotrzebny |

## MVP
- Rejestracja / logowanie / wylogowanie, sesje.
- Profil (dane podstawowe, zdjęcia - upload w kolejnym etapie), zainteresowania, lokalizacja przybliżona.
- Discovery z filtrami wieku, odległości, płci preferowanej.
- Swipe (like/pass/superlike), atomowe tworzenie matchu w transakcji.
- Lista matchy + czat tekstowy (polling).
- Blokowanie i zgłaszanie użytkowników/treści.
- Panel admina (podstawowy: przegląd zgłoszeń, RBAC `isAdmin`).
- Rate limiting, walidacja (zod) i autoryzacja na każdym endpoincie.

## Poza MVP
- Płatności/subskrypcje premium (model `Subscription` już przygotowany w schemacie).
- Aplikacje natywne mobilne.
- Zaawansowana/AI moderacja treści.
- Realtime WebSocket, powiadomienia push.
- OAuth (Google/Apple itp.).

## Architektura
Monolit modularny w Next.js (App Router):
- `src/app/(marketing)` - strony publiczne (landing, przyszły onboarding).
- `src/app/api/*` - endpointy REST (route handlers), każdy z walidacją zod + kontrolą sesji.
- `src/lib/*` - logika domenowa (auth, sesje, rate limiting, geolokalizacja) niezależna od
  warstwy HTTP, testowalna jednostkowo.
- `prisma/schema.prisma` - jedyne źródło prawdy o modelu danych, migracje wersjonowane w repo.

Brak mikroserwisów, brak kolejki zdarzeń - nieuzasadnione na obecną skalę (zgodnie z zasadą
skilla "preferuj prostą architekturę monolitu modularnego").

## Model danych
Zaimplementowano w `prisma/schema.prisma`: `User`, `Session`, `Profile`, `Interest`,
`ProfileInterest`, `Preference`, `Photo`, `Swipe`, `Match`, `Message`, `Block`, `Report`,
`ModerationCase`, `Notification`, `Subscription`, `AuditLog`.

Kluczowe reguły integralności:
- `Swipe` ma unikalny indeks `(initiatorId, targetId)` - zapobiega duplikatom.
- `Match` ma unikalny indeks `(userAId, userBId)` z kanonicznym sortowaniem ID (mniejsze
  ID zawsze jako `userAId`) - zapobiega duplikatom matchy i race condition przy
  jednoczesnym swipe z obu stron (tworzenie w transakcji, patrz etap "Swipe i match").
- `User.deletedAt` - soft delete (prawo do usunięcia konta bez utraty integralności
  historycznych wiadomości drugiej strony matchu).
- Dane wrażliwe: `Session.ipHash` (hash, nie surowy IP), `Profile.approxLat/approxLng`
  (zaokrąglone), hasła wyłącznie jako `passwordHash`.

## API i realtime
Zaimplementowane w tym etapie:
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```
Zaplanowane w kolejnych etapach (patrz sekcja Etapy):
```
PATCH  /api/me/profile
POST   /api/me/photos/presign
GET    /api/discovery
POST   /api/swipes
GET    /api/matches
GET    /api/matches/:id/messages
POST   /api/matches/:id/messages
POST   /api/users/:id/block
POST   /api/reports
DELETE /api/me
```
Realtime: w MVP polling `GET /api/matches/:id/messages?after=<timestamp>` co 3-5s po
stronie klienta. Każdy request musi zweryfikować członkostwo użytkownika w danym matchu
(nigdy nie ufać samemu `matchId` z klienta) - patrz zasada bezpieczeństwa w brief skilla.

## Etapy realizacji

### Etap 1 - Discovery, założenia, decyzje architektoniczne ✅ (ten etap)
- Cel: ustalić zakres MVP, ograniczenia hostingu, kryteria akceptacji.
- Pliki: `docs/product-brief.md`, `docs/implementation-plan.md`, `docs/assumptions.md`.
- Kryteria akceptacji: użytkownik zna kompromisy (MySQL zamiast Postgres, brak Redis,
  polling zamiast WebSocket) i je akceptuje.

### Etap 2 - Bootstrap repo, konfiguracja ✅ (ten etap)
- Next.js 16 (App Router, TS strict, Tailwind, ESLint), Prisma, zod, argon2.
- Własny `server.js` (Passenger-compatible entrypoint), `postinstall` = generate + build.
- `.env.example`, `docker-compose.yml` (MySQL - dev only).
- Kryteria akceptacji: `npm run build` przechodzi bez błędów, `npm run lint` i
  `npm run typecheck` czyste.

### Etap 3 - Schema MySQL/Prisma, migracje, seed
- Cel: kompletny model danych gotowy pod kolejne etapy.
- Pliki: `prisma/schema.prisma` (zrobione), `prisma/migrations/*` (do wygenerowania po
  podłączeniu prawdziwej bazy - wymaga `DATABASE_URL`), `prisma/seed.ts` (do dodania).
- Kryteria akceptacji: `npx prisma migrate dev` tworzy schemat bez błędów na czystej
  bazie MySQL; seed tworzy przykładowych użytkowników.
- Status: schemat gotowy, migracja wymaga działającej bazy (patrz "Następny krok").

### Etap 4 - Autoryzacja i sesje ✅ (częściowo w tym etapie)
- `POST /api/auth/register`, `/login`, `/logout`, `GET /api/me` (zrobione).
- Rate limiting, Argon2id, sesje w tabeli `Session` z rewokacją.
- Do dodania: reset hasła (token e-mail), potwierdzenie e-mail, testy integracyjne.

### Etap 5 - Profil, onboarding, zdjęcia
- `PATCH /api/me/profile`, upload zdjęć (presigned URL do object storage), zainteresowania.
- Wymaga decyzji: dostawca S3-compatible storage (patrz `docs/assumptions.md`).

### Etap 6 - Discovery i filtry
- `GET /api/discovery` z filtrami wieku/odległości/płci, wykluczenie już oswajpowanych,
  zablokowanych i własnego profilu.

### Etap 7 - Swipe i match (transakcyjnie)
- `POST /api/swipes`, tworzenie matchu w transakcji Prisma z kanonicznym sortowaniem ID,
  obsługa duplikatu swipe (idempotencja), obsługa "unmatch".

### Etap 8 - Lista matchy i czat
- `GET /api/matches`, `GET/POST /api/matches/:id/messages` z pollingiem po stronie klienta,
  walidacja członkostwa w matchu przy każdym żądaniu.

### Etap 9 - Blokowanie, zgłoszenia, moderacja
- `POST /api/users/:id/block`, `POST /api/reports`, kolejka `ModerationCase`.

### Etap 10 - Panel administracyjny
- RBAC (`User.isAdmin`), przegląd zgłoszeń, audyt (`AuditLog`).

### Etap 11 - Testy, bezpieczeństwo, wydajność
- Vitest/Jest (logika domenowa), Supertest (API), Playwright (e2e: rejestracja → swipe →
  match → czat). Testy negatywne: duplikat swipe, brak dostępu do cudzego matchu,
  zablokowany użytkownik, wygasła sesja, zbyt duży plik.

### Etap 12 - Observability, backupy, deployment na Aderlo Cloud
- Deployment (szczegóły niżej), logi błędów bez danych wrażliwych, kopie zapasowe bazy
  (JetBackup dostępny w panelu Aderlo - do skonfigurowania).

### Etap 13 - Beta, analityka, iteracje
### Etap 14 - Płatności i funkcje premium

## Deployment (Aderlo Cloud - cPanel "Setup Node.js App")
Aplikacja Node.js na domenie `test.gpczarnecki.pl` już istnieje w panelu (Node v22.23.0,
root: `/home/fkgptbrs/domains/test.gpczarnecki.pl/public_html`, Passenger, potwierdzone
przez `.htaccess`: `PassengerStartupFile server.js`). Zweryfikowana procedura:

1. Wgrać pełne źródła projektu (bez `node_modules`, `.next`, `.git`) do App Root Directory -
   `node_modules` jest tam symlinkiem do `nodevenv` zarządzanego przez cPanel, nie ruszamy go.
2. Własny plik `server.js` w repo root uruchamia Next.js programowo przez `next({ dev })` +
   `http.createServer` - to jest wymagane, bo Passenger wykonuje plik startowy bezpośrednio
   przez `node`, a nie przez `npm start`/CLI `next start`.
3. `package.json` ma `"postinstall": "prisma generate && next build"` - dzięki temu
   przycisk **"Run NPM Install"** w cPanel ("Setup Node.js App" → edycja aplikacji) w jednym
   kroku instaluje zależności, generuje klienta Prisma i buduje `.next` na serwerze
   (serwer ma pełny dostęp do internetu, więc pobranie silnika Prisma tam zadziała, w
   przeciwieństwie do sandboksa tej sesji - patrz `docs/assumptions.md`).
4. Zmienne środowiskowe: albo w sekcji "Environment Variables" w cPanel "Setup Node.js App",
   albo w pliku `.env` wgranym bezpośrednio do App Root - Next.js wczytuje `.env` automatycznie
   nawet z własnym `server.js`. Wymagane: `DATABASE_URL` (MySQL), `SESSION_SECRET`.
   `NODE_ENV`/`PORT` ustawia Passenger automatycznie (tryb "production" widoczny w panelu).
5. `npx prisma migrate deploy` - wymaga dostępu do terminala (SSH lub cPanel Terminal) na
   serwerze, żeby zastosować migracje na docelowej bazie MySQL. Bez tego kroku endpointy
   korzystające z bazy nie zadziałają, ale strona główna (bez bazy) wystartuje poprawnie.
6. Restart aplikacji w panelu (przycisk restart w "Setup Node.js App").

Kroki 3, 5 i 6 wymagają kliknięcia w panelu cPanel/terminala - narzędzia dostępne w tej
sesji (Aderlo MCP) pozwalają wyłącznie na operacje plikowe, nie na uruchamianie poleceń ani
restart aplikacji, więc te kroki wykonuje użytkownik ręcznie.

## Bezpieczeństwo i prywatność
- Argon2id, sesje HTTP-only/Secure/SameSite=Lax, tokeny haszowane w bazie.
- Rate limiting na rejestracji/logowaniu (rozszerzyć na swipe/wiadomości/upload w kolejnych etapach).
- Walidacja wejścia (zod) na każdym endpoincie, autoryzacja sprawdzana per-request (nigdy
  nie ufamy identyfikatorom z klienta bez weryfikacji własności/członkostwa).
- Minimalizacja danych lokalizacyjnych (współrzędne zaokrąglone).
- RODO: soft delete kont, plan twardego usuwania danych do zaprojektowania w Etapie 5/9.
- Zagadnienia prawne (branding, RODO, wiek pełnoletności per kraj UE) - do konsultacji
  z prawnikiem, nie jest to porada prawna.

## Ryzyka

| Ryzyko | Prawdopodobieństwo | Skutek | Mitigacja |
|---|---|---|---|
| Passenger na hostingu współdzielonym nie wspiera długożyjących WebSocketów | Średnie | Czat realtime niedostępny w formie zakładanej domyślnym stosem | MVP używa pollingu; przetestować WebSocket na środowisku testowym przed decyzją |
| Brak Redis ogranicza rate limiting przy wielu procesach/restartach | Niskie przy małej skali | Limity nieszczelne przy skalowaniu | Przenieść limiter do tabeli MySQL lub włączyć Redis gdy będzie dostępny |
| Hosting współdzielony ma limity zasobów (CPU/RAM/quota) | Średnie | Degradacja wydajności przy wzroście ruchu | Monitorować `account_usage`; plan migracji do VPS/managed hostingu przy wzroście |
| Brak potwierdzonego dostawcy object storage na zdjęcia | Wysokie (nieustalone) | Blokuje Etap 5 | Decyzja z użytkownikiem przed startem etapu profil/zdjęcia |

## Definition of Done
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` przechodzą bez błędów
- [ ] Migracje Prisma stosują się czysto na pustej bazie MySQL
- [ ] Każdy endpoint ma walidację wejścia i kontrolę autoryzacji
- [ ] Brak sekretów w repo (`.env` w `.gitignore`, `.env.example` uzupełniony)
- [ ] `docs/assumptions.md` zaktualizowany o decyzje podjęte w danym etapie
- [ ] Testy pokrywają happy path + przypadki brzegowe wymienione w skillu

## Następny krok
Podłączyć prawdziwą bazę MySQL (lokalnie przez `docker compose up -d` albo dane z panelu
Aderlo) i wygenerować pierwszą migrację: `npx prisma migrate dev --name init`. Dopiero
wtedy Etap 3 można oznaczyć jako w pełni ukończony (obecnie: schemat gotowy, migracja
niewygenerowana z braku aktywnego połączenia do bazy w tej sesji).
