import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brak output: "standalone" - cPanel "Setup Node.js App" (Passenger) instaluje pełne
  // node_modules na serwerze przyciskiem "Run NPM Install", więc nie potrzebujemy
  // samodzielnego bundla. Uruchamiane przez własny server.js (patrz plik w repo root) -
  // Passenger wywołuje go bezpośrednio jako "Application Startup File".

  // Hosting współdzielony (CloudLinux/LVE) ogranicza liczbę procesów systemowych na konto -
  // domyślny build (Turbopack i zwykły webpack) próbuje odpalać dodatkowe procesy node do
  // kompilacji/minifikacji (jest-worker -> spawn EAGAIN). workerThreads: true każe Next.js
  // używać wątków w obrębie jednego procesu (worker_threads) zamiast forkowania nowych
  // procesów - omija limit LVE. cpus: 1 dodatkowo ogranicza równoległość do bezpiecznego minimum.
  experimental: {
    workerThreads: true,
    cpus: 1,
  },
};

export default nextConfig;
