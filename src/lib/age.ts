// Wiek liczony zawsze z birthDate w danym momencie - nigdy nie przechowujemy
// osobnego pola "wiek" (unikamy niespójności po urodzinach użytkownika).
export function calculateAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}
