export const statuses = [
  { value: "unopened", label: "Avaamaton", short: "Avaamaton", level: 1 },
  { value: "three_quarters", label: "3/4 jäljellä", short: "3/4", level: 0.75 },
  { value: "half", label: "2/4 jäljellä", short: "2/4", level: 0.5 },
  { value: "quarter", label: "1/4 jäljellä", short: "1/4", level: 0.25 },
  { value: "archived", label: "Arkistoitu", short: "Arkistoitu", level: 0 },
];
export const statusOf = (value) =>
  statuses.find((s) => s.value === value) || statuses[0];
export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const emptyBottle = (kind = "bottle") => ({
  kind,
  tastingGroup: "",
  tasted: today(),
  distillery: "",
  name: "",
  abv: "",
  volume: "",
  purchased: today(),
  status: "unopened",
  comments: "",
  rating: 0,
  image: "",
  country: "",
  age: "",
});
export function parseLabel(text) {
  const result = {};
  const normalized = text.replace(/,/g, ".");
  const abv = normalized.match(/\b(\d{2}(?:\.\d{1,2})?)\s*%/);
  if (abv && +abv[1] <= 100) result.abv = abv[1];
  const volume = normalized.match(
    /\b(\d+(?:\.\d+)?)\s*(ml|cl|litres?|liters?|l)\b/i,
  );
  if (volume)
    result.volume = String(
      Math.round(
        +volume[1] *
          (/^cl$/i.test(volume[2]) ? 10 : /^ml$/i.test(volume[2]) ? 1 : 1000),
      ),
    );
  const age = normalized.match(/\b(\d{1,2})\s*(?:years?\s*(?:old)?|yo)\b/i);
  if (age) result.age = age[1];
  const distilleries = [
    "Bruichladdich",
    "Ardbeg",
    "Laphroaig",
    "Lagavulin",
    "Bowmore",
    "Caol Ila",
    "Bunnahabhain",
    "Kilchoman",
    "Glenfiddich",
    "Glenlivet",
    "Macallan",
    "Talisker",
    "Highland Park",
    "Balvenie",
    "Glenmorangie",
    "Oban",
    "Springbank",
    "Arran",
    "Benromach",
    "Glenfarclas",
    "Dalmore",
    "Aberlour",
    "Kyrö",
    "Teerenpeli",
    "Nikka",
    "Yamazaki",
    "Hakushu",
    "Jameson",
    "Redbreast",
    "Bushmills",
    "Buffalo Trace",
    "Maker’s Mark",
    "Woodford Reserve",
    "Wild Turkey",
  ];
  const distillery = distilleries.find((d) =>
    normalized.toLowerCase().includes(d.toLowerCase()),
  );
  if (distillery) result.distillery = distillery;
  if (/port\s+charlotte/i.test(normalized)) {
    result.name = "Port Charlotte";
    result.distillery = "Bruichladdich";
  } else if (/octomore/i.test(normalized)) {
    result.name = "Octomore";
    result.distillery = "Bruichladdich";
  } else if (/classic\s+laddie/i.test(normalized)) {
    result.name = "The Classic Laddie";
    result.distillery = "Bruichladdich";
  }
  if (/scotch|scotland|islay|speyside|highland/i.test(normalized))
    result.country = "Skotlanti";
  else if (/irish|ireland/i.test(normalized)) result.country = "Irlanti";
  else if (/japan/i.test(normalized)) result.country = "Japani";
  else if (/finland|finnish/i.test(normalized)) result.country = "Suomi";
  else if (/bourbon|kentucky/i.test(normalized)) result.country = "Yhdysvallat";
  return result;
}
export function validateBottle(bottle) {
  if (bottle.kind === "tasting" && !bottle.tastingGroup?.trim())
    return "Kirjoita tasting-ryhmän tai maistelun nimi.";
  if (
    bottle.kind === "tasting" &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(bottle.tasted || "") ||
      Number.isNaN(Date.parse(bottle.tasted)) ||
      new Date(bottle.tasted).toISOString().slice(0, 10) !== bottle.tasted)
  )
    return "Valitse kelvollinen maistelupäivä.";
  if (!bottle.name?.trim()) return "Kirjoita viskin tuotenimi.";
  if (!bottle.distillery?.trim()) return "Kirjoita tislaamon nimi.";
  if (
    bottle.abv !== "" &&
    (!Number.isFinite(+bottle.abv) || +bottle.abv <= 0 || +bottle.abv > 100)
  )
    return "Alkoholipitoisuuden tulee olla yli 0 ja enintään 100 %.";
  if (
    bottle.volume !== "" &&
    (!Number.isFinite(+bottle.volume) ||
      +bottle.volume <= 0 ||
      +bottle.volume > 100000)
  )
    return "Tarkista pullon koko millilitroina.";
  if (
    bottle.age !== "" &&
    (!Number.isInteger(+bottle.age) || +bottle.age < 0 || +bottle.age > 150)
  )
    return "Tarkista viskin ikä vuosina.";
  if (!statuses.some((s) => s.value === bottle.status))
    return "Valitse pullon tila.";
  if (
    !Number.isInteger(bottle.rating) ||
    bottle.rating < 0 ||
    bottle.rating > 5
  )
    return "Arvion tulee olla 0–5 tähteä.";
  if (
    typeof bottle.purchased !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(bottle.purchased) ||
    Number.isNaN(Date.parse(bottle.purchased)) ||
    new Date(bottle.purchased).toISOString().slice(0, 10) !== bottle.purchased
  )
    return "Valitse kelvollinen ostopäivä.";
  return "";
}
export function parseBackup(data) {
  if (
    data?.format !== "whisky-catalog" ||
    data.version !== 1 ||
    !Array.isArray(data.bottles)
  )
    throw new Error("Tiedosto ei ole Whisky Catalog -varmuuskopio.");
  const ids = new Set();
  return data.bottles.map((b) => {
    if (
      !b ||
      typeof b !== "object" ||
      typeof b.id !== "string" ||
      !b.id ||
      ids.has(b.id)
    )
      throw new Error("Varmuuskopion pullotunnisteissa on virhe.");
    ids.add(b.id);
    for (const key of [
      "name",
      "distillery",
      "abv",
      "volume",
      "purchased",
      "comments",
      "country",
      "age",
      "image",
    ])
      if (typeof b[key] !== "string")
        throw new Error("Varmuuskopion pullotiedoissa on virhe.");
    if (
      b.image &&
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.image)
    )
      throw new Error("Varmuuskopio sisältää virheellisen kuvan.");
    b = { kind: "bottle", tastingGroup: "", tasted: b.purchased, ...b };
    if (
      !["bottle", "tasting"].includes(b.kind) ||
      typeof b.tastingGroup !== "string" ||
      typeof b.tasted !== "string"
    )
      throw new Error("Varmuuskopion maistelutiedoissa on virhe.");
    if (b.createdAt === undefined) b.createdAt = `${b.purchased}T12:00:00.000Z`;
    if (
      typeof b.createdAt !== "string" ||
      Number.isNaN(Date.parse(b.createdAt))
    )
      throw new Error("Varmuuskopion luontiajassa on virhe.");
    const error = validateBottle(b);
    if (error) throw new Error(error);
    return Object.fromEntries(
      [
        "id",
        "kind",
        "tastingGroup",
        "tasted",
        "name",
        "distillery",
        "abv",
        "volume",
        "purchased",
        "status",
        "comments",
        "rating",
        "country",
        "age",
        "image",
        "createdAt",
      ].map((key) => [key, b[key]]),
    );
  });
}
