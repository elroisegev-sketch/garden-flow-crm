export const DEFAULT_KDF_ITERATIONS = 120_000;

export function bytesToB64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function b64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function assertPin(pin: string): void {
  if (!/^\d{4,6}$/.test(pin)) throw new Error("הקוד צריך להיות 4 עד 6 ספרות.");
}

async function derivePinKey(pin: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: asBuffer(salt), iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function createVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function encryptBuffer(key: CryptoKey, data: ArrayBuffer): Promise<{ iv: Uint8Array<ArrayBuffer>; cipher: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { iv, cipher };
}

export async function decryptBuffer(key: CryptoKey, cipher: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, cipher);
}

async function wrapVaultKey(pinKey: CryptoKey, vaultKey: CryptoKey): Promise<{ ivB64: string; wrappedB64: string }> {
  const raw = await crypto.subtle.exportKey("raw", vaultKey);
  const { iv, cipher } = await encryptBuffer(pinKey, raw);
  return { ivB64: bytesToB64(iv), wrappedB64: bytesToB64(cipher) };
}

async function unwrapVaultKey(pinKey: CryptoKey, wrappedB64: string, ivB64: string): Promise<CryptoKey> {
  const raw = await decryptBuffer(pinKey, asBuffer(b64ToBytes(wrappedB64)), b64ToBytes(ivB64));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}

export interface PinWrap {
  saltB64: string;
  wrappedKeyB64: string;
  wrappedKeyIvB64: string;
  iterations: number;
  pinLength: number;
  vaultKey: CryptoKey;
}

export async function protectWithPin(pin: string, iterations = DEFAULT_KDF_ITERATIONS): Promise<PinWrap> {
  assertPin(pin);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const pinKey = await derivePinKey(pin, salt, iterations);
  const vaultKey = await createVaultKey();
  const wrapped = await wrapVaultKey(pinKey, vaultKey);
  return {
    saltB64: bytesToB64(salt),
    wrappedKeyB64: wrapped.wrappedB64,
    wrappedKeyIvB64: wrapped.ivB64,
    iterations,
    pinLength: pin.length,
    vaultKey,
  };
}

export async function openWithPin(pin: string, stored: { saltB64: string; wrappedKeyB64: string; wrappedKeyIvB64: string; kdfIterations: number }): Promise<CryptoKey> {
  assertPin(pin);
  const pinKey = await derivePinKey(pin, b64ToBytes(stored.saltB64), stored.kdfIterations || DEFAULT_KDF_ITERATIONS);
  try {
    return await unwrapVaultKey(pinKey, stored.wrappedKeyB64, stored.wrappedKeyIvB64);
  } catch {
    throw new Error("הקוד שגוי.");
  }
}

export async function rewrapWithPin(vaultKey: CryptoKey, pin: string, iterations = DEFAULT_KDF_ITERATIONS): Promise<Omit<PinWrap, "vaultKey">> {
  assertPin(pin);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const pinKey = await derivePinKey(pin, salt, iterations);
  const wrapped = await wrapVaultKey(pinKey, vaultKey);
  return {
    saltB64: bytesToB64(salt),
    wrappedKeyB64: wrapped.wrappedB64,
    wrappedKeyIvB64: wrapped.ivB64,
    iterations,
    pinLength: pin.length,
  };
}

export async function importRawAes(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
