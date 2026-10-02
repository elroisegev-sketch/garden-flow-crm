import assert from "node:assert/strict";
import test from "node:test";
import { buildPdf } from "./pdf";

test("builds a readable pdf header", () => {
  const bytes = buildPdf("Hotel reservation", ["DEMO-HT-2002", "Vienna"]);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 8)), "%PDF-1.4");
  assert.ok(bytes.length > 200);
});
