let sessionKey: CryptoKey | null = null;
let lastActivity = Date.now();

export function setSessionKey(key: CryptoKey | null): void {
  sessionKey = key;
  lastActivity = Date.now();
}

export function getSessionKey(): CryptoKey | null {
  return sessionKey;
}

export function hasSessionKey(): boolean {
  return sessionKey !== null;
}

export function touchActivity(): void {
  lastActivity = Date.now();
}

export function idleForMs(): number {
  return Date.now() - lastActivity;
}
