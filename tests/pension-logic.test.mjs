import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCountdown,
  getRetirementDate,
} from "../app/pension.ts";

test("uses age 57 for women and 62 for men", () => {
  assert.equal(
    getRetirementDate("1990-06-15", "mujer").getFullYear(),
    2047,
  );
  assert.equal(
    getRetirementDate("1990-06-15", "hombre").getFullYear(),
    2052,
  );
});

test("handles leap-day birthdays safely", () => {
  const target = getRetirementDate("2000-02-29", "mujer");
  assert.equal(target.getFullYear(), 2057);
  assert.equal(target.getMonth(), 1);
  assert.equal(target.getDate(), 28);
});

test("returns a calendar-aware countdown", () => {
  const result = calculateCountdown(
    new Date(2026, 0, 15, 10, 20, 30),
    new Date(2028, 2, 17, 12, 25, 35),
  );
  assert.deepEqual(result, {
    years: 2,
    months: 2,
    days: 2,
    hours: 2,
    minutes: 5,
    seconds: 5,
    reached: false,
  });
});

test("never shows negative time after reaching the target", () => {
  const result = calculateCountdown(
    new Date(2030, 0, 2),
    new Date(2030, 0, 1),
  );
  assert.equal(result.reached, true);
  assert.equal(result.years, 0);
  assert.equal(result.seconds, 0);
});
