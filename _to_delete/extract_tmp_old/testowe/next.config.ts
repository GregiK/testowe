import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brak output: "standalone" - cPanel "Setup Node.js App" (Passenger) instaluje pełne
  // node_modules na serwerze przyciskiem "Run NPM Install", więc nie potrzebujemy
  // samodzielnego bundla. Uruchamiane przez własny server.js (patrz plik w repo root) -
  // Passenger wywołuje go bezpośrednio jako "Application Startup File".
};

export default nextConfig;
