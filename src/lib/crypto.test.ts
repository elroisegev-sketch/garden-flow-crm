import assert from "node:assert/strict";
import test from "node:test";
import { decryptBuffer, encryptBuffer, openWithPin, protectWithPin } from "./crypto";

test("pin wraps a key that decrypts a document", async () => {
  const protectedVault = await protectWithPin("2468", 1_000);
  const opened = await openWithPin("2468", {
    saltB64: protectedVault.saltB64,
    wrappedKeyB64: protectedVault.wrappedKeyB64,
    wrappedKeyIvB64: protectedVault.wrappedKeyIvB64,
    kdfIterations: protectedVault.iterations,
  });
  const payload = new TextEncoder().encode("boarding-pass").buffer;
  const encrypted = await encryptBuffer(opened, payload);
  const decrypted = await decryptBuffer(opened, encrypted.cipher, encrypted.iv);
  assert.equal(new TextDecoder().decode(decrypted), "boarding-pass");
});

test("wrong pin does not open the vault", async () => {
  const protectedVault = await protectWithPin("1357", 1_000);
  await assert.rejects(() =>
    openWithPin("9999", {
      saltB64: protectedVault.saltB64,
      wrappedKeyB64: protectedVault.wrappedKeyB64,
      wrappedKeyIvB64: protectedVault.wrappedKeyIvB64,
      kdfIterations: protectedVault.iterations,
    }),
  );
});
