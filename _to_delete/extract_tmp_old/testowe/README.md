# Iskra (robocza nazwa) - aplikacja randkowa

Legalna, bezpieczna aplikacja randkowa (Polska/UE) budowana od podstaw - własna nazwa,
identyfikacja i UX, bez kopiowania rozwiązań chronionych prawem.

Pełny plan projektu: [`docs/implementation-plan.md`](docs/implementation-plan.md)
Założenia i decyzje: [`docs/assumptions.md`](docs/assumptions.md)
Product brief: [`docs/product-brief.md`](docs/product-brief.md)

## Stos technologiczny
- Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS 4
- Prisma + MySQL (dopasowane do hostingu docelowego - Aderlo Cloud)
- Argon2id (hasła), sesje serwerowe w cookie HTTP-only
- Walidacja: zod

## Uruchomienie lokalne

1. Skopiuj `.env.example` do `.env` i uzupełnij wartości.
2. Uruchom lokalną bazę MySQL: `docker compose up -d`
3. Zainstaluj zależności: `npm install`
4. Wygeneruj i zastosuj migracje: `npm run db:migrate`
5. Start dev servera: `npm run dev`

Aplikacja wystartuje na [http://localhost:3000](http://localhost:3000).

## Komendy

```bash
npm run dev         # serwer developerski
npm run build       # build produkcyjny (.next)
npm run start       # start server.js (Passenger-compatible entrypoint)
npm run lint        # ESLint
npm run typecheck   # sprawdzenie typów TS (strict)
npm run db:migrate  # migracje Prisma (dev)
npm run db:deploy   # migracje Prisma (produkcja)
npm run db:studio   # podgląd bazy (Prisma Studio)
```

## Wdrożenie (Aderlo Cloud - test.gpczarnecki.pl)
Szczegółowa procedura: [`docs/implementation-plan.md`](docs/implementation-plan.md#deployment-aderlo-cloud---cpanel-setup-nodejs-app).
W skrócie: wgrać źródła (bez `node_modules`/`.next`/`.git`) do App Root → w cPanel
"Setup Node.js App" kliknąć "Run NPM Install" (uruchamia install + `prisma generate` +
`next build` dzięki `postinstall` w `package.json`) → ustawić zmienne środowiskowe
(`DATABASE_URL`, `SESSION_SECRET`) → `npx prisma migrate deploy` z terminala → restart.

## Status projektu
Etap 1-2 (discovery, bootstrap) ukończone. Etap 3 (schemat bazy) gotowy, migracja czeka
na podłączenie prawdziwej bazy danych. Zobacz "Następny krok" w
[`docs/implementation-plan.md`](docs/implementation-plan.md#następny-krok).
