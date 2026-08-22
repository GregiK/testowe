# Product brief - "Iskra" (robocza nazwa aplikacji randkowej)

## Kontekst
Aplikacja randkowa inspirowana mechaniką dopasowań i przesuwania kart znaną z popularnych
aplikacji (np. Tinder), budowana od podstaw - bez kopiowania nazwy, brandingu, tekstów,
grafik, kodu ani układu interfejsu. Nazwa "Iskra" jest robocza i do potwierdzenia/zmiany
przez właściciela produktu.

## Rynek i grupa docelowa
- Polska i UE, użytkownicy pełnoletni (18+, weryfikacja przez datę urodzenia przy rejestracji).
- Model ogólny (nie niszowy) w MVP - szeroka grupa docelowa dorosłych szukających randek.
- Model freemium: darmowe konto podstawowe + funkcje premium w kolejnym etapie (poza MVP).

## Platforma
- MVP: responsywna aplikacja webowa (PWA-ready), Next.js.
- Aplikacje natywne (iOS/Android) - poza zakresem MVP, do rozważenia po walidacji rynku.

## Hosting docelowy
- Aderlo Cloud - hosting współdzielony (cPanel), uruchamianie przez "Setup Node.js App"
  (Passenger), Node.js v22.x.
- Baza danych: MySQL (8 baz dostępnych na koncie), Redis wyłączony.
- Domena robocza/testowa: test.gpczarnecki.pl (istniejąca aplikacja Node.js w cPanel,
  root: /home/fkgptbrs/domains/test.gpczarnecki.pl/public_html).
- Konsekwencje architektoniczne tego wyboru opisane w docs/implementation-plan.md
  (sekcje Architektura i Deployment) oraz docs/assumptions.md.

## Zakres MVP (szybki prototyp, etapy skrócone 1-8 wg skilla)
1. Rejestracja/logowanie (e-mail + hasło), sesje po stronie serwera.
2. Profil: zdjęcia, opis, zainteresowania, lokalizacja przybliżona.
3. Discovery z filtrami wieku, odległości, preferencji.
4. Swipe (like/pass/superlike) + atomowe tworzenie matchu.
5. Lista matchy i czat (tylko po matchu).
6. Blokowanie i zgłaszanie użytkowników.
7. Panel administracyjny (podstawowy, RBAC).
8. Bezpieczeństwo: rate limiting, walidacja, autoryzacja na każdym endpoincie.

## Poza MVP
- Płatności/subskrypcje premium.
- Aplikacje natywne mobilne.
- Zaawansowana moderacja treści (automatyczna, AI).
- Realtime WebSocket (Socket.IO) - w MVP czat działa na krótkim pollingu ze względu na
  ograniczenia hostingu współdzielonego (Passenger); patrz docs/assumptions.md.

## Sposób logowania
- E-mail + hasło (Argon2id), sesje HTTP-only cookie z tokenem opaque haszowanym w bazie.
- OAuth (Google itp.) - do rozważenia w kolejnym etapie.

## Lokalizacja i prywatność
- Przechowywane współrzędne zaokrąglone (brak dokładnej lokalizacji w profilu publicznym).
- Zgodność z RODO: eksport i usunięcie danych na żądanie, retencja opisana w schemacie
  (soft delete + plan twardego usunięcia).

## Moderacja i bezpieczeństwo
- Zgłoszenia użytkowników i zdjęć, blokowanie, kolejka moderacyjna (ModerationCase).
- Rate limiting na rejestracji, logowaniu, swipe'ach i wiadomościach.

## Budżet, termin, skala
- Nie określono formalnie - przyjęto założenie: mały zespół/jednoosobowy projekt,
  start na hostingu współdzielonym (Aderlo Cloud), migracja do VPS/managed hostingu przy
  wzroście skali. Zapisane w docs/assumptions.md.
