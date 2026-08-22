import argon2 from "argon2";

// Argon2id - zalecany domyślny algorytm hashowania haseł (skill: bezpieczeństwo i prywatność).
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
