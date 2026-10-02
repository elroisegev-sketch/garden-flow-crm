import assert from "node:assert/strict";
import test from "node:test";
import { findPaymentSecret } from "./secrets";

test("allows demo booking numbers and phones", () => {
  assert.equal(findPaymentSecret("DEMO-PC-1001"), null);
  assert.equal(findPaymentSecret("טלפון: +43 1 47646587"), null);
});

test("blocks a full card number and cvv", () => {
  assert.match(findPaymentSecret("4111 1111 1111 1111") ?? "", /אשראי/);
  assert.match(findPaymentSecret("cvv: 123") ?? "", /CVV/);
});
