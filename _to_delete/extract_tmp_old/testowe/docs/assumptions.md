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

## Produkt
- Rynek: Polska/UE, użytkownicy pełnoletni, model ogólny (nie niszowy).
- Model freemium - płatności/subskrypcje odłożone poza MVP.
- Nazwa robocza aplikacji: "Iskra" - do zatwierdzenia lub zmiany przez właściciela produktu
  przed startem publicznym (branding, domena, znak towarowy - do sprawdzenia prawnego).

## Zespół i tempo
- Przyjęto: mały/jednoosobowy zespół, praca etapowa z zatwierdzaniem po każdym kroku
  (zgodnie z globalnymi instrukcjami użytkownika - łatwo się rozprasza, więc każde zadanie
  jest domykane do potwierdzenia zamiast zostawiane w połowie).

## Bezpieczeństwo prawne
- RODO/GDPR: w tym etapie zaimplementowano wyłącznie fundamenty techniczne (soft delete,
  minimalizacja danych, haszowanie haseł/tokenów). Pełna zgodność (polityka prywatności,
  podstawy prawne przetwarzania, rejestr czynności) wymaga konsultacji z prawnikiem/IOD -
  nie jest to porada prawna.
