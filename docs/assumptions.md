# Założenia (docs/assumptions.md)

Zapisane zgodnie z zasadą skilla: gdy brak informacji wpływa na architekturę, a można
przyjąć bezpieczne założenie zamiast blokować pracę, zapisujemy je tutaj do potwierdzenia.

## Hosting i infrastruktura
- **Hosting produkcyjny = Aderlo Cloud (cPanel, "Setup Node.js App" / Passenger).**
  Potwierdzone przez użytkownika (istniejąca aplikacja Node.js na test.gpczarnecki.pl,
  Node v22.23.0, tryb production).
- **Redis niedostępny** (`redis_enabled: "no"` na koncie Aderlo) → w MVP rate limiting
  działa w pamięci procesu (`src/lib/rate-limit.ts`). Ograniczenie: liczniki nie są
  współdzielone między restartami/procesami. Do rewizji przy skalowaniu.
- **Baza danych = MySQL**, nie PostgreSQL/PostGIS (konto ma 8 baz MySQL, brak wzmianki
  o Postgresie). Odległość geograficzna liczona w aplikacji (haversine), nie w bazie.
  Patrz `src/lib/geo.ts`.
- **Realtime (czat) w MVP bez WebSocket/Socket.IO.** Passenger na hostingu współdzielonym
  zwykle nie gwarantuje długożyjących połączeń WebSocket bez dodatkowej konfiguracji
  serwera/proxy, której nie mamy potwierdzonej. MVP: krótki polling (np. co 3-5s) po
  stronie klienta dla listy wiadomości. Do weryfikacji z hostingiem przed etapem "chat
  realtime" - jeśli WebSocket faktycznie działa na Aderlo, można przejść na Socket.IO.
- **Docker Compose wyłącznie do lokalnego developmentu.** Produkcja nie korzysta z Dockera
  (hosting współdzielony nie daje takiej kontroli).
- **Object storage na zdjęcia jeszcze nie skonfigurowany.** MVP zakłada S3-kompatybilny
  storage zewnętrzny (zmienne w `.env.example`) - do potwierdzenia z użytkownikiem który
  dostawca (np. Cloudflare R2, Backblaze B2) przed etapem uploadu zdjęć.
- **`prisma generate` nigdy nie uruchamiać przez `postinstall`/`start`/`dev` na tym
  hostingu.** Pierwsza próba (postinstall = `prisma generate && next build`, wywoływane
  przyciskiem "Run NPM Install") zawiesiła proces na serwerze na ok. 21 godzin.
- **Prisma cofnięta do 6.x** (zamiast 7.x) - stabilna, dobrze udokumentowana składnia
  `datasource.url = env("DATABASE_URL")` w `schema.prisma` bez potrzeby dodatkowego
  `prisma.config.ts`, którego zachowanie w wersji 7 nie było pewne w tym środowisku.
  Generator Prisma ma jawnie ustawione `binaryTargets` (`native`, `debian-openssl-3.0.x`,
  `rhel-openssl-3.0.x`, `rhel-openssl-1.1.x`) - build dzieje się na Ubuntu (GitHub Actions),
  a serwer to CloudLinux (RHEL-based), więc bez tego silnik Prisma wygenerowałby się tylko
  pod system budujący i mógłby nie wystartować na serwerze.
- **Próba `next build` bezpośrednio na serwerze (przez Terminal w panelu) kończyła się
  błędem `EAGAIN`/`ERR_WORKER_INIT_FAILED`** - Turbopack i domyślny webpack odpalają dodatkowe
  procesy systemowe do kompilacji/minifikacji, a CloudLinux/LVE tego nie pozwala w pewnych
  konfiguracjach. Naprawione częściowo przez `next build --webpack` +
  `experimental.workerThreads: true` w `next.config.ts` (wątki zamiast nowych procesów).
  Docelowo i tak zbędne, patrz punkt niżej - build przeniesiony do CI.
- **Pełna automatyzacja wdrożenia przez "Automatyczne wdrożenie z Gita" w panelu Aderlo
  (odkryte 2026-08-16, zakładka "Wdrożenia").** Panel oferuje naturalny mechanizm: klonuje
  wskazaną gałąź repo 1:1 do App Root Directory po każdym pushu (webhook), ale **niczego nie
  buduje**. Rozwiązanie: `.github/workflows/deploy.yml` buduje całą aplikację (npm ci, prisma
  generate, next build --webpack, npm prune --omit=dev) i publikuje gotowy, kompletny pakiet
  (kod + `node_modules` produkcyjne + `.next` + świeży `tmp/restart.txt` wymuszający restart
  Passengera) na osobną gałąź `deploy`. Połączenie Git w panelu musi wskazywać na gałąź
  `deploy` (nie `main`!) i katalog `domains/test.gpczarnecki.pl/public_html`. Efekt: zwykły
  `git push origin main` na komputerze użytkownika = pełne, automatyczne wdrożenie na
  serwer, bez żadnych ręcznych kroków w panelu przy kolejnych zmianach. To zastępuje wcześniej
  opisywany przepływ z przyciskami "Run NPM Install"/"Uruchom skrypt JS" (który dodatkowo
  okazał się wadliwie działać w panelu - przycisk tworzył plik `.lock`, ale nigdy realnie nie
  wywoływał npm).
- **Hashowanie haseł: `scrypt` (wbudowany moduł `crypto` Node.js) zamiast `argon2`
  (2026-08-23).** Pakiet `argon2` wymaga skompilowania natywnego modułu przy instalacji
  (`node-gyp-build`/`node-gyp rebuild`) - na koncie Aderlo Cloud spawnowanie takich procesów
  kończy się błędem `EAGAIN` (ten sam twardy limit CloudLinux/LVE, który wcześniej blokował
  `prisma migrate deploy` i `next build` bez `--webpack`). Ponieważ `node_modules` jest
  budowany raz w CI (GitHub Actions) i commitowany na gałąź `deploy`, docelowo nie powinno to
  mieć znaczenia - ale każda próba ręcznej naprawy/reinstalacji zależności na serwerze (np. po
  uszkodzeniu `node_modules`) była niemożliwa właśnie przez `argon2`. Zamieniono na `scrypt`
  z wbudowanego modułu `crypto` (parametry N=16384, r=8, p=1, zgodne z zaleceniami OWASP) -
  zero natywnych zależności, więc `npm ci`/`npm install` działa na tym hostingu bez ograniczeń.
  Baza danych była pusta w momencie zmiany (brak zarejestrowanych kont), więc migracja
  istniejących hashy nie była potrzebna.

- **Discovery (Etap 6) - dopasowanie wzajemne, bez odległości geograficznej (2026-08-23).**
  Lista kandydatów filtrowana jest w obie strony: moje preferencje (wiek, płeć) względem
  kandydata ORAZ preferencje kandydata względem mnie - unikamy pokazywania profili, które i
  tak nigdy nie zobaczyłyby/nie polubiłyby użytkownika z drugiej strony. Filtr odległości
  geograficznej (`approxLat`/`approxLng`) świadomie pominięty na tym etapie - formularz
  profilu jeszcze nie zbiera lokalizacji użytkownika (wymaga zgody na geolokalizację +
  UI, planowane w późniejszym etapie). Discovery na tym etapie to wyłącznie przeglądanie
  kart (Poprzedni/Następny) - akcje polub/odrzuć i tworzenie matchy to Etap 7.

- **Swipe i match (Etap 7) - atomowo w transakcji, kanoniczne sortowanie userId
  (2026-08-23).** Polubienie zapisywane jako `Swipe`, a match powstaje wyłącznie gdy druga
  strona wcześniej polubiła nas (sprawdzenie wzajemności + `upsert` matchu w jednej
  transakcji Prisma) - `userAId`/`userBId` zawsze posortowane rosnąco, więc unikalny
  indeks `[userAId, userBId]` wyklucza duplikaty niezależnie od kolejności polubień.
  Zablokowani użytkownicy (`Block`) są wykluczeni z możliwości swipe'a w obie strony.
- **Chat (Etap 8) - polling zamiast WebSocket/Socket.IO (2026-08-23).** Hosting
  współdzielony Aderlo Cloud (Passenger) nie gwarantuje długożyjących połączeń
  wymaganych przez WebSockety. Zamiast tego czat odświeża wiadomości co 4 sekundy przez
  zwykłe zapytanie HTTP. Rozwiązanie wystarczające dla MVP i skali testowej - przy
  realnym wzroście ruchu do rozważenia: Server-Sent Events albo zewnętrzna usługa
  realtime (np. Pusher/Ably), jeśli hosting docelowy się zmieni.

- **Blokowanie i zgłaszanie (Etap 9) - blokada natychmiast kończy match (2026-08-23).**
  Zablokowanie użytkownika: (1) tworzy rekord `Block` sprawdzany przez discovery i swipe
  (zablokowani nie widzą się nawzajem, nie mogą polubić), (2) natychmiast kończy istniejący
  aktywny match (`unmatchedAt`/`unmatchedBy`) w tej samej transakcji, więc czat przestaje
  być dostępny. Zgłoszenie (`Report`) jest niezależne od blokady - można zgłosić bez
  blokowania i odwrotnie. Kolejka moderacyjna (przegląd zgłoszeń przez admina,
  `ModerationCase`) zaplanowana w Etapie 10 (panel administratora) - na tym etapie
  zgłoszenia trafiają do bazy, ale nie ma jeszcze interfejsu do ich przeglądania.

- **Panel administratora (Etap 10) - RBAC przez pojedynczą flagę `isAdmin` (2026-08-23).**
  Na tym etapie skali (jednoosobowy zespół) pełny system ról byłby przedwczesną
  komplikacją - `User.isAdmin` sprawdzane przez `getCurrentAdminUserId()` w każdym
  endpointzie/stronie panelu (`/admin`, `/api/admin/*`). Nieautoryzowany dostęp jest
  przekierowywany na `/app` zamiast pokazywać komunikat "brak dostępu" - nie ujawniamy
  istnienia trasy. Każda zmiana statusu zgłoszenia zapisywana do `AuditLog`. Skalowanie do
  wielu ról (moderator/support/superadmin) odłożone do czasu, aż pojawi się więcej niż
  jedna osoba zarządzająca platformą.

- **Testy automatyczne (Etap 11) - Vitest, wyłącznie logika domenowa bez bazy danych
  (2026-08-23).** Wybrano Vitest zamiast Jest - zero natywnych zależności kompilowanych
  przy instalacji (istotne z uwagi na historię EAGAIN na hostingu, choć testy i tak
  uruchamiają się wyłącznie w CI/GitHub Actions, nigdy na serwerze produkcyjnym).
  Pokrycie testami: hashowanie haseł (`scrypt`), liczenie wieku, wszystkie schematy
  walidacji (`zod`) - rejestracja, profil, swipe, wiadomości, zgłoszenia. Świadomie
  pominięte na tym etapie: testy integracyjne uderzające w prawdziwą bazę MySQL (`discovery.ts`,
  endpointy API) - wymagałyby serwisu bazy danych w GitHub Actions; testy e2e (Playwright)
  najważniejszych ścieżek (rejestracja→profil→swipe→match→czat). Oba warte dodania w
  kolejnej iteracji, gdy będzie więcej czasu/budżetu na infrastrukturę CI.
- **Naprawa CI (2026-08-23) - usunięto martwy krok wysyłki przez API Aderlo.** Krok
  odwoływał się do sekretu `ADERLO_LOGIN_KEY`, który nigdy nie został utworzony (plan API
  porzucony tego samego dnia, gdy okazało się, że panel Aderlo udostępnia wyłącznie tokeny
  MCP, nie prosty klucz kompatybilny z Basic Auth/curl) - krok mógł od tamtego momentu
  cichcem kończyć joba niepowodzeniem, mimo że właściwy build i publikacja na gałąź
  "deploy" przechodziły poprawnie wcześniej w tym samym uruchomieniu.

- **Observability (Etap 12) - logger JSON + health check + strony błędów (2026-08-23).**
  `src/lib/logger.ts` loguje wyłącznie komunikat błędu, nigdy pełnego obiektu żądania -
  zapobiega przypadkowemu wyciekowi haseł/tokenów do logów serwera. `/api/health`
  sprawdza faktyczne połączenie z bazą (nie tylko czy proces Node żyje) - do podpięcia
  pod zewnętrzny monitoring (np. UptimeRobot), które wykryje np. błędny `DATABASE_URL` po
  zmianie zmiennych środowiskowych. Dodano `error.tsx`/`global-error.tsx`/`not-found.tsx` -
  użytkownik nigdy nie widzi surowego stack trace'a błędu.
- **Kopie zapasowe bazy danych (Etap 12) - ustalenie: automatyczny backup poziomu
  aplikacji na koncie Aderlo NIE obejmuje regularnie tej domeny, a kopii samej bazy MySQL
  w ogóle nie było (2026-08-23).** Sprawdzono katalogi `application_backups/` i `backups/`
  na koncie hostingowym: inne aplikacje na tym koncie mają świeże, automatyczne kopie co
  kilka dni, ale dla `test.gpczarnecki.pl` ostatnia taka kopia pochodzi z 2025-11-06 (sprzed
  obecnej wersji aplikacji) - mechanizm automatycznego backupu najwyraźniej przestał
  obejmować tę domenę (do sprawdzenia/ponownego włączenia w panelu Aderlo, sekcja
  dotycząca backupów aplikacji Node.js). Katalog `backups/` (prywatny, tryb 700) był
  całkowicie pusty - **żadna kopia bazy danych nie istniała do tej pory**. Dodano
  `/home/fkgptbrs/backup-db.sh` (`mysqldump` + gzip + rotacja do 14 najnowszych kopii,
  zapis do `/home/fkgptbrs/backups/`) - wymaga jednorazowego utworzenia pliku
  `~/.mysql-backup.cnf` z danymi dostępowymi do MySQL przez samego użytkownika (Claude
  nie zapisuje haseł do plików na koncie hostingowym - zablokowane świadomie przez
  zabezpieczenia tej sesji). Zalecane: uruchamiać `backup-db.sh` cyklicznie przez Cron
  Jobs w panelu Aderlo (do zweryfikowania, czy panel to udostępnia) - do czasu
  skonfigurowania tego, kopie trzeba uruchamiać ręcznie.

## Produkt
- Rynek: Polska/UE, użytkownicy pełnoletni, model ogólny (nie niszowy).
- Model freemium - płatności/subskrypcje odłożone poza MVP.
- Nazwa robocza aplikacji: "Iskra" - do zatwierdzenia lub zmiany przez właściciela produktu
  przed startem publicznym (branding, domena, znak towarowy - do sprawdzenia prawnego).

- **Beta i podstawowa analityka (Etap 13) - minimalny lejek zdarzeń, bez PII poza samym
  userId.** Nowa tabela `AnalyticsEvent` (nazwa zdarzenia + opcjonalne minimalne metadane,
  np. rodzaj swipe'a - NIGDY treść wiadomości, adres IP czy inne dane wrażliwe) - zgodnie
  z zasadą minimalizacji danych RODO. Śledzone zdarzenia: `user_registered`,
  `profile_updated`, `swipe`, `match_created`, `message_sent`, `user_blocked` (oraz
  `oauth_login` od Etapu 15). Awaria zapisu zdarzenia (`trackEvent`) nigdy nie przerywa
  właściwej akcji użytkownika - błąd jest wyłącznie logowany. Panel administratora
  (`/admin`) pokazuje te liczby z ostatnich 7 dni jako prosty lejek aktywacji. Tabela
  `AnalyticsEvent` NIE jest tworzona migracją Prisma (`prisma migrate deploy` blokowany
  przez EAGAIN na tym hostingu) - jak wszystkie zmiany schematu w tym projekcie, wymaga
  ręcznego importu SQL przez phpMyAdmin (patrz dołączony plik).

- **Logowanie przez Google/Facebook (Etap 15) - ręczny OAuth2 Authorization Code (+PKCE),
  bez NextAuth.** Aplikacja ma już własny, prosty system sesji (opaque token w httpOnly
  cookie, hash w tabeli `Session` - patrz `src/lib/session.ts`); wprowadzenie biblioteki
  typu NextAuth/Auth.js wymagałoby migracji tego modelu sesji na jej własny, co byłoby
  nieproporcjonalnie dużą zmianą architektoniczną względem tej funkcji. Zamiast tego
  zaimplementowano ręcznie standardowy przepływ OAuth2 Authorization Code z PKCE dla
  Google (Facebook go nie wymaga) - wyłącznie przy użyciu wbudowanych modułów Node.js
  (`crypto`, `fetch`), zero nowych zależności npm, więc zero ryzyka związanego z limitem
  procesów kompilujących natywne moduły (EAGAIN) na hostingu Aderlo Cloud. Ochrona CSRF:
  losowy `state` przechowywany w krótkotrwałym (10 min) httpOnly cookie, porównywany przy
  powrocie z dostawcy. Nowa tabela `OAuthAccount` (provider, providerAccountId, userId,
  email) pozwala jednemu kontu User mieć wiele powiązanych dostawców; `User.passwordHash`
  stał się nullable (konta czysto-OAuth nie mają hasła). Łączenie kont: gdy dostawca
  zwraca zweryfikowany e-mail (Google: `email_verified=true`; Facebook: e-mail jest
  zwracany przez Graph API wyłącznie dla potwierdzonych adresów) pasujący do istniejącego
  konta z hasłem, nowe logowanie OAuth zostaje powiązane z tym kontem zamiast tworzyć
  duplikat. Onboarding: żaden z dostawców nie udostępnia daty urodzenia w podstawowym
  zakresie uprawnień, a `Profile.birthDate` jest wymagane do weryfikacji 18+ - nowe konta
  OAuth trafiają na `/onboarding` (nowy ekran: imię, data urodzenia, płeć) zanim uzyskają
  dostęp do `/app`. Tabela `OAuthAccount` i poluzowanie `User.passwordHash` NIE są
  wprowadzane migracją Prisma (ten sam powód EAGAIN co wcześniej) - wymagają ręcznego
  importu SQL przez phpMyAdmin (patrz dołączony plik). Klucze klienta (Client ID/Secret)
  dla Google i Facebooka konfiguruje właściciel produktu w panelu Aderlo (Node.js
  Selector), tak samo jak `DATABASE_URL`/`SESSION_SECRET` - bez nich przyciski logowania
  społecznościowego przekierowują na `/login` z komunikatem "chwilowo niedostępne" zamiast
  błędu 500. Wymaga też dodania `APP_BASE_URL` w tej samej konfiguracji (używana do
  zbudowania adresu przekierowania powrotnego) - wcześniej niepotrzebna w produkcji, więc
  mogła nie zostać jeszcze ustawiona.

## Zespół i tempo
- Przyjęto: mały/jednoosobowy zespół, praca etapowa z zatwierdzaniem po każdym kroku
  (zgodnie z globalnymi instrukcjami użytkownika - łatwo się rozprasza, więc każde zadanie
  jest domykane do potwierdzenia zamiast zostawiane w połowie).

## Bezpieczeństwo prawne
- RODO/GDPR: w tym etapie zaimplementowano wyłącznie fundamenty techniczne (soft delete,
  minimalizacja danych, haszowanie haseł/tokenów). Pełna zgodność (polityka prywatności,
  podstawy prawne przetwarzania, rejestr czynności) wymaga konsultacji z prawnikiem/IOD -
  nie jest to porada prawna.

## Etap 16 - tryb demo (5 profili + wejście bez logowania)
- **Cel:** umożliwić szybki podgląd działania aplikacji (discovery, swipe, match, czat)
  bez zakładania prawdziwego konta i bez hasła.
- **Decyzja: funkcja domyślnie WYŁĄCZONA, sterowana zmienną środowiskową
  `DEMO_MODE_ENABLED`.** Rozważane opcje: (a) trwale publiczny przycisk "wejdź jako
  gość" widoczny dla każdego odwiedzającego produkcję, (b) funkcja włączana świadomie
  zmienną środowiskową i domyślnie wyłączona. Wybrano (b) - to strona logowania na
  produkcyjnej domenie (`test.gpczarnecki.pl`), na której są już prawdziwi
  zarejestrowani użytkownicy; trwałe, publiczne obejście logowania na takiej domenie
  byłoby nieproporcjonalnym ryzykiem bezpieczeństwa (każdy odwiedzający mógłby wejść do
  panelu aplikacji), a funkcja ma służyć wyłącznie właścicielowi produktu do przeglądu.
  Kompromis: właściciel musi świadomie ustawić `DEMO_MODE_ENABLED=true` w panelu Aderlo
  (Node.js Selector), obejrzeć aplikację, a potem tę zmienną usunąć/ustawić na `false`
  przed udostępnieniem produkcji szerszej grupie.
- **5 kont demo** (Anna, Piotr, Marta, Tomasz, Kasia) - konta testowe, `passwordHash`
  ustawiony na `NULL` (ten sam wzorzec co konta czysto-OAuth z Etapu 15 - logowanie
  wyłącznie przez dedykowaną ścieżkę `/api/auth/demo/[slug]`, nigdy przez zwykły
  formularz hasła). Rozmieszczone geograficznie blisko siebie (okolice Gdańska) i
  dobrane pod płeć/preferencje tak, żeby dało się zobaczyć realne dopasowania (match)
  bez zmiany domyślnych filtrów odległości/wieku. Dane wstawiane ręcznym SQL (ten sam
  powód co Etap 13/15 - unikanie `prisma migrate`/kompilacji na serwerze z limitem
  EAGAIN) - patrz dołączony plik `iskra-demo-profiles.sql`. Import jest bezpiecznie
  powtarzalny (najpierw usuwa wyłącznie wiersze o ID zaczynających się od `demo-`, nigdy
  nie rusza prawdziwych kont).
- **Ścieżka logowania:** `GET /api/auth/demo/[slug]` - zwykły klikalny link (bez JS,
  wzorem startu OAuth z Etapu 15), zablokowany chyba że `DEMO_MODE_ENABLED === "true"`,
  dodatkowo z rate-limitem. Loguje wyłącznie na jedno z 5 z góry zdefiniowanych ID kont
  (whitelist w `src/lib/demo.ts`) - nie da się tą drogą zalogować na żadne inne konto.
  Zdarzenie `demo_login` trafia do analityki (Etap 13) z metadanymi, którego profilu
  demo użyto.

## Etap 20 - kinowe tlo na stronie glownej

Problem: uzytkownik po wdrozeniu Etapu 19 (kinowy efekt tla - Ken Burns + iskierki + ziarno
filmowe na /login i /register) poprosil o to samo tlo takze na stronie glownej "/".

Opcje:
1. Skopiowac logike CinematicAuthBackground do osobnego komponentu dla strony glownej.
2. Uzyc wprost istniejacego komponentu CinematicAuthBackground (fixed inset-0 -z-10) rowniez
   na "/", bez duplikacji kodu.

Wybor: opcja 2. CinematicAuthBackground jest juz w pelni generyczny (nie zawiera nic
specyficznego dla logowania/rejestracji), wiec import i uzycie go na stronie glownej nie
wymaga zadnych zmian w komponencie - tylko dodanie <CinematicAuthBackground /> w
src/app/page.tsx, nad istniejacym <AnimatedHero /> (Etap 18, bez zmian).

Kompromisy: na stronie glownej istnieje juz statyczne zdjecie w karcie (PortraitContent w
animated-hero.tsx) - to samo zdjecie (/images/hero-portrait.jpg) pojawia sie teraz takze,
przytlumione (opacity 45%) i w ruchu, w tle. Uznane za spojne z reszta serwisu (ten sam motyw
wizualny co na /login i /register) i nie koliduje wizualnie - tlo jest mocno przyciemnione i
rozmyte wzgledem ostrej karty ze zdjeciem na pierwszym planie.
