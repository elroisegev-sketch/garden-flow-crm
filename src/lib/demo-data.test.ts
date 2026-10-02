import assert from "node:assert/strict";
import test from "node:test";
import { buildViennaDemo } from "./demo-data";

test("vienna demo links every file and favorite the airport set", () => {
  const demo = buildViennaDemo();
  assert.equal(demo.trip.destination, "Vienna");
  assert.equal(demo.trip.startDate, "2026-10-04");
  assert.equal(demo.trip.endDate, "2026-10-08");
  assert.deepEqual(demo.travelers.map((traveler) => traveler.nameEn), ["Elroi", "Lior"]);
  const fileIds = new Set(demo.fileSpecs.map((spec) => spec.fileId));
  for (const document of demo.documents) {
    if (document.fileId) assert.ok(fileIds.has(document.fileId), document.id);
  }
  const favorites = demo.documents.filter((document) => document.favorite).map((document) => document.title);
  for (const title of ["Passport – Elroi", "Boarding Pass – Elroi", "Hotel Reservation", "Travel Insurance", "Car Voucher"]) {
    assert.ok(favorites.includes(title), title);
  }
  const tuesday = demo.activities.filter((activity) => activity.dayId.endsWith("2026-10-06")).map((activity) => activity.title);
  assert.deepEqual(tuesday, ["Breakfast", "Pick up / leave Vienna", "Lunzer See", "Walk", "Picnic", "Coffee", "Return Vienna"]);
  assert.equal(demo.flights[0]?.flightNumber, "LY 361");
  assert.equal(demo.flights[0]?.seats[0]?.seat, "46K");
  assert.equal(demo.flights[0]?.seats[1]?.seat, "46J");
  assert.equal(demo.flights[1]?.flightNumber, "LY 364");
  assert.equal(demo.flights[1]?.arrivalDate, "2026-10-09");
  assert.equal(demo.flights[1]?.boardingPassDocumentIds.length, 0);
  assert.equal(demo.documents.some((document) => document.id === "doc-flight-archive"), true);
  assert.equal(demo.documents.some((document) => document.id === "doc-flight-lior"), true);
  assert.equal(demo.documents.some((document) => document.id === "doc-archive-lior"), true);
  const boarding = demo.documents.find((document) => document.id === "doc-bp-elroi-out");
  assert.equal(boarding?.fileType, "application/pdf");
  assert.equal(demo.fileSpecs.find((spec) => spec.fileId === boarding?.fileId)?.assetPath, "/vault/boarding-elroi.pdf");
  for (const fileId of ["file-bp-lior-out", "file-flight-out", "file-flight-lior", "file-flight-archive", "file-archive-lior"]) {
    const spec = demo.fileSpecs.find((item) => item.fileId === fileId);
    assert.equal(spec?.mime, "application/pdf");
    assert.match(spec?.assetPath ?? "", /^\/vault\/.+\.pdf$/);
  }
  assert.equal(demo.activities.find((activity) => activity.id === "act-dep")?.time, "06:40");
  assert.equal(demo.checklist.length, 26);
});
