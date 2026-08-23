// Dekoracyjne tło stron logowania/rejestracji - patrz globals.css (.auth-atmosphere).
// Czysto ozdobne (aria-hidden), zero wpływu na dostępność i SEO.
export function AuthAtmosphere() {
  return <div className="auth-atmosphere" aria-hidden="true" />;
}
