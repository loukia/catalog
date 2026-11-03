import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyBottle,
  parseBackup,
  parseLabel,
  today,
  validateBottle,
} from "../src/catalog.js";
test("label extracts Bruichladdich product, strength and bottle size", () => {
  assert.deepEqual(
    parseLabel(
      "BRUICHLADDICH\nPORT CHARLOTTE\nISLAY SINGLE MALT\n10 YEARS OLD\n50% vol. 70cl",
    ),
    {
      abv: "50",
      volume: "700",
      age: "10",
      distillery: "Bruichladdich",
      name: "Port Charlotte",
      country: "Skotlanti",
    },
  );
});
test("label handles decimal comma and liters without inventing a product", () => {
  assert.deepEqual(parseLabel("SCOTCH WHISKY 46,3% 0,7 L"), {
    abv: "46.3",
    volume: "700",
    country: "Skotlanti",
  });
  assert.deepEqual(parseLabel("An unreadable label"), {});
});
test("entry validation protects ratings, real dates and required tasting groups", () => {
  const b = {
    ...emptyBottle(),
    distillery: "Bruichladdich",
    name: "Port Charlotte",
  };
  assert.equal(b.purchased, today());
  assert.equal(validateBottle(b), "");
  assert.match(validateBottle({ ...b, rating: 6 }), /0–5/);
  assert.match(validateBottle({ ...b, purchased: "2026-02-30" }), /ostopäivä/);
  assert.match(validateBottle({ ...b, kind: "tasting" }), /ryhmän/);
  assert.equal(
    validateBottle({
      ...b,
      kind: "tasting",
      tastingGroup: "Islay-ilta",
      tasted: "2026-11-03",
    }),
    "",
  );
});
test("backup keeps photos and independent tasting sessions and rejects unsafe input", () => {
  const b = {
    ...emptyBottle("tasting"),
    id: "one",
    name: "Port Charlotte",
    distillery: "Bruichladdich",
    tastingGroup: "Islay-ilta",
    image: "data:image/jpeg;base64,YQ==",
  };
  const backup = {
    format: "whisky-catalog",
    version: 1,
    bottles: [b, { ...b, id: "two", tasted: "2026-10-01" }],
  };
  const restored = parseBackup(backup);
  assert.equal(restored.length, 2);
  assert.equal(restored[0].image, b.image);
  assert.equal(restored[1].tasted, "2026-10-01");
  assert.throws(() => parseBackup({ ...backup, bottles: [b, b] }), /tunniste/);
  assert.throws(
    () =>
      parseBackup({
        ...backup,
        bottles: [{ ...b, image: "https://example.com/track" }],
      }),
    /kuvan/,
  );
});
