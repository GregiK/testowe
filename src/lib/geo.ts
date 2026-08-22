// Odległość między dwoma punktami (przybliżonymi współrzędnymi profilu) - wzór haversine.
// Hosting docelowy (MySQL na Aderlo Cloud) nie ma PostGIS, więc dla MVP filtrujemy zgrubnie
// bounding-boxem w zapytaniu SQL, a dokładną odległość liczymy w aplikacji. Przy większej
// skali rozważyć indeks geoprzestrzenny / zewnętrzny serwis wyszukiwania.
const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Zaokrągla współrzędne tak, aby publiczny profil nie ujawniał dokładnej lokalizacji
// (ochrona prywatności - patrz docs/implementation-plan.md, sekcja Bezpieczeństwo).
export function roundForPrivacy(coord: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(coord * factor) / factor;
}
