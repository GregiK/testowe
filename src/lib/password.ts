import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

// Parametry zgodne z zaleceniami OWASP dla scrypt (pamięć ~16 MB na hash).
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

// scrypt (moduł wbudowany w Node.js, bez natywnych zależności) - wybrany zamiast Argon2id,
// ponieważ docelowy hosting (Aderlo Cloud, CloudLinux) blokuje spawnowanie procesów
// kompilujących natywne moduły (błąd EAGAIN), co uniemożliwia instalację pakietów takich
// jak `argon2` czy `bcrypt`. scrypt jest częścią standardowej biblioteki Node.js i nie
// wymaga żadnej kompilacji. Patrz docs/assumptions.md.
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(plain, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    const parts = hash.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, nStr, rStr, pStr, saltHex, keyHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const expectedKey = Buffer.from(keyHex, "hex");
    if (salt.length === 0 || expectedKey.length === 0) return false;

    const derivedKey = await scrypt(plain, salt, expectedKey.length, {
      N: Number(nStr),
      r: Number(rStr),
      p: Number(pStr),
    });

    return derivedKey.length === expectedKey.length && timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}
