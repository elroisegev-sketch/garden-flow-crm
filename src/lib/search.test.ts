import assert from "node:assert/strict";
import test from "node:test";
import { buildViennaDemo } from "./demo-data";
import { searchVault } from "./search";

const demo = buildViennaDemo();

function search(query: string) {
  return searchVault(
    {
      tripId: demo.trip.id,
      documents: demo.documents,
      travelers: demo.travelers,
      flights: demo.flights,
      hotels: demo.hotels,
      attractions: demo.attractions,
      cars: demo.cars,
      insurances: demo.insurances,
      esims: demo.esims,
      activities: demo.activities,
      days: demo.days,
      checklist: demo.checklist,
    },
    query,
  );
}

test("passport finds both passports", () => {
  const titles = search("passport").map((result) => result.title);
  assert.ok(titles.includes("Passport – Elroi"));
  assert.ok(titles.includes("Passport – Lior"));
});

test("hebrew passport query works", () => {
  assert.ok(search("דרכון").some((result) => result.title.includes("Passport")));
});

test("car finds the rental", () => {
  assert.ok(search("car").some((result) => result.href === "/car" || result.title.includes("Car")));
});

test("schonbrunn finds the tickets", () => {
  assert.ok(search("schonbrunn").some((result) => result.title.includes("Schönbrunn")));
});
