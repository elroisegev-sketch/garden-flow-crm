import assert from "node:assert/strict";
import test from "node:test";
import { matchRoute } from "./routes";

test("matches the main vault routes", () => {
  assert.equal(matchRoute("/").name, "home");
  assert.equal(matchRoute("/documents/new").name, "document-new");
  assert.deepEqual(matchRoute("/present/doc-pass-elroi"), { name: "present", id: "doc-pass-elroi" });
  assert.deepEqual(matchRoute("/flights/flight-out/edit"), { name: "flight-edit", id: "flight-out" });
  assert.equal(matchRoute("/missing").name, "not-found");
});
