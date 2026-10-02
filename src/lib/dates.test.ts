import assert from "node:assert/strict";
import test from "node:test";
import { eachDate, formatDot, tripPhase, weekday } from "./dates";

test("formats the Vienna range in day.month.year", () => {
  assert.equal(formatDot("2026-10-04"), "04.10.2026");
});

test("4 October 2026 is Sunday", () => {
  assert.equal(weekday("2026-10-04").en, "Sunday");
  assert.equal(weekday("2026-10-06").en, "Tuesday");
});

test("counts five trip days", () => {
  assert.deepEqual(eachDate("2026-10-04", "2026-10-08"), [
    "2026-10-04",
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
  ]);
});

test("countdown before the flight", () => {
  const phase = tripPhase("2026-10-04", "2026-10-08", new Date(2026, 9, 2));
  assert.equal(phase.kind, "upcoming");
  assert.equal(phase.label, "עוד 2 ימים לטיסה");
});

test("day count after the trip starts", () => {
  const phase = tripPhase("2026-10-04", "2026-10-08", new Date(2026, 9, 5));
  assert.deepEqual(phase, { kind: "active", day: 2, total: 5, label: "יום 2 מתוך 5" });
});

test("marks the trip as finished the day after return", () => {
  const phase = tripPhase("2026-10-04", "2026-10-08", new Date(2026, 9, 9));
  assert.equal(phase.kind, "ended");
});
