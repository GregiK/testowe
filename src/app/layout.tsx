import type { Metadata } from "next";
import "./globals.css";

// Uwaga: celowo bez next/font/google (Geist) - pobieranie czcionek z Google Fonts w
// czasie builda wymaga dostępu do fonts.googleapis.com, co nie jest gwarantowane na każdym
// środowisku budującym (np. sandbox tej sesji, potencjalnie też hosting współdzielony).
// Zamiast tego używamy systemowego stosu fontów (patrz globals.css) - zero zależności
// sieciowych podczas builda, brak ryzyka przerwania `next build`.

export const metadata: Metadata = {
  title: "Iskra - aplikacja randkowa (wersja robocza)",
  description: "Iskra - legalna, bezpieczna aplikacja randkowa budowana od podstaw (Polska/UE). Wersja robocza / MVP w budowie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
