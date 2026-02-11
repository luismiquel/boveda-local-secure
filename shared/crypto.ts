
/**
 * Utilidades Criptográficas de Grado Militar
 * AES-GCM 256 + PBKDF2
 */

const AES_GCM = "AES-GCM";
const PBKDF2 = "PBKDF2";
const CANARY_SECRET = "BOVEDA_VERIFIED_V3";

const buf2base64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base642buf = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

export async function deriveKEK(pin: string, salt: string, iterations: number): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw", encoder.encode(pin), PBKDF2, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: PBKDF2, salt: base642buf(salt), iterations, hash: "SHA-256" },
    baseKey,
    { name: AES_GCM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptRaw(data: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt({ name: AES_GCM, iv }, key, encoded);
  return { ciphertext: buf2base64(encrypted), iv: buf2base64(iv) };
}

export async function decryptRaw(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: AES_GCM, iv: base642buf(iv) },
    key,
    base642buf(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

export async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: AES_GCM, length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function wrapDEK(dek: CryptoKey, kek: CryptoKey) {
  const exported = await crypto.subtle.exportKey("raw", dek);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: AES_GCM, iv }, kek, exported);
  return { ciphertext: buf2base64(encrypted), iv: buf2base64(iv) };
}

export async function unwrapDEK(wrapped: { ciphertext: string; iv: string }, kek: CryptoKey): Promise<CryptoKey> {
  const decrypted = await crypto.subtle.decrypt(
    { name: AES_GCM, iv: base642buf(wrapped.iv) },
    kek,
    base642buf(wrapped.ciphertext)
  );
  return crypto.subtle.importKey("raw", decrypted, AES_GCM, true, ["encrypt", "decrypt"]);
}

export async function createCanary(dek: CryptoKey) {
  return encryptRaw(CANARY_SECRET, dek);
}

export async function verifyDEK(dek: CryptoKey, canary: { ciphertext: string; iv: string }): Promise<boolean> {
  try {
    const val = await decryptRaw(canary.ciphertext, canary.iv, dek);
    return val === CANARY_SECRET;
  } catch { return false; }
}
