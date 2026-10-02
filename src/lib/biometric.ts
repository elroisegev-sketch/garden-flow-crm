import { b64ToBytes, bytesToB64, decryptBuffer, encryptBuffer, importRawAes } from "./crypto";

function randomBytes(size: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(size));
}

function bufferOf(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

interface PrfResults {
  prf?: { results?: { first?: ArrayBuffer } };
}

function readPrf(credential: PublicKeyCredential): ArrayBuffer | null {
  const extensions = credential.getClientExtensionResults() as PrfResults;
  return extensions.prf?.results?.first ?? null;
}

export function biometricAvailable(): boolean {
  return typeof window !== "undefined" && "PublicKeyCredential" in window && window.isSecureContext;
}

export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!biometricAvailable()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function mapBiometricError(error: unknown): Error {
  if (error instanceof Error && error.message.startsWith("Face ID")) return error;
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError") return new Error("האימות בוטל.");
  return new Error("Face ID לא זמין בדפדפן הזה. אפשר להמשיך עם קוד.");
}

export interface BiometricWrap {
  credentialIdB64: string;
  prfSaltB64: string;
  wrappedKeyB64: string;
  wrappedKeyIvB64: string;
}

export async function createBiometricWrap(vaultKey: CryptoKey): Promise<BiometricWrap> {
  if (!biometricAvailable()) throw new Error("Face ID זמין רק בחיבור מאובטח, למשל אחרי ההתקנה למסך הבית.");
  const prfSalt = randomBytes(32);
  const userId = randomBytes(16);
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: "Travel Vault" },
        user: { id: userId, name: "travel-vault", displayName: "Travel Vault" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required",
        },
        timeout: 60_000,
        extensions: { prf: { eval: { first: prfSalt } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("Face ID לא הופעל.");
    const prf = readPrf(credential);
    if (!prf) throw new Error("הדפדפן לא מאפשר לשחרר את ההצפנה עם Face ID. השתמשו בקוד.");
    const prfKey = await importRawAes(prf);
    const rawVault = await crypto.subtle.exportKey("raw", vaultKey);
    const wrapped = await encryptBuffer(prfKey, rawVault);
    return {
      credentialIdB64: bytesToB64(credential.rawId),
      prfSaltB64: bytesToB64(prfSalt),
      wrappedKeyB64: bytesToB64(wrapped.cipher),
      wrappedKeyIvB64: bytesToB64(wrapped.iv),
    };
  } catch (error) {
    throw mapBiometricError(error);
  }
}

export async function openWithBiometric(stored: BiometricWrap): Promise<CryptoKey> {
  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        userVerification: "required",
        allowCredentials: [{ type: "public-key", id: bufferOf(b64ToBytes(stored.credentialIdB64)) }],
        timeout: 60_000,
        extensions: { prf: { eval: { first: b64ToBytes(stored.prfSaltB64) } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    if (!assertion) throw new Error("Face ID לא אומת.");
    const prf = readPrf(assertion);
    if (!prf) throw new Error("לא התקבל מפתח מ-Face ID.");
    const prfKey = await importRawAes(prf);
    const raw = await decryptBuffer(prfKey, bufferOf(b64ToBytes(stored.wrappedKeyB64)), b64ToBytes(stored.wrappedKeyIvB64));
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
  } catch (error) {
    throw mapBiometricError(error);
  }
}
