import { test, expect } from "@playwright/test";

async function addBottle(
  page,
  {
    name = "Port Charlotte",
    tasting = false,
    group = "Islay-ilta",
    rating = 4,
    photo = false,
  } = {},
) {
  await page
    .getByRole("button", {
      name: tasting ? "Lisää maistelu" : "Lisää pullo",
      exact: true,
    })
    .click();
  await page.getByLabel("Tislaamo *", { exact: true }).fill("Bruichladdich");
  await page.getByLabel("Tuotenimi", { exact: false }).fill(name);
  if (tasting)
    await page
      .getByLabel("Tasting-ryhmä tai maisteluilta", { exact: false })
      .fill(group);
  await page.getByLabel("Alkoholipitoisuus", { exact: true }).fill("50");
  await page.getByLabel("Pullon koko", { exact: true }).fill("700");
  await page
    .getByLabel("Omat kommentit", { exact: true })
    .fill("Turvetta, suolaisuutta ja pitkä jälkimaku.");
  await page
    .getByRole("button", { name: `${rating} tähteä`, exact: true })
    .click();
  if (photo) {
    await page
      .locator('input[accept="image/jpeg,image/png,image/webp"]')
      .setInputFiles("tests/fixtures/label.png");
    await expect(
      page.getByText("Tunnistetut ehdotukset", { exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", {
      name: tasting ? "Tallenna maistelu" : "Tallenna pullo",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function navigate(page, name) {
  if (
    await page
      .getByRole("button", { name: "Avaa valikko", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Avaa valikko", exact: true })
      .click();
  await page
    .locator("nav")
    .getByRole("button", { name: new RegExp(name) })
    .click();
}
for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["phone", { width: 390, height: 844 }],
]) {
  test(`${device}: save, edit, archive, restore, delete and persist`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await expect(
      page.getByText("Ensimmäinen pullo, ensimmäinen tarina."),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      viewport.width,
    );
    await addBottle(page);
    await expect(page.locator(".bottle-card")).toHaveCount(1);
    await page.reload();
    await expect(page.locator(".bottle-card")).toHaveCount(1);
    await page.locator(".bottle-card").click();
    await expect(
      page.getByText("Turvetta, suolaisuutta ja pitkä jälkimaku.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Muokkaa pullon tietoja" }).click();
    await page.getByLabel("Pullon tila", { exact: true }).selectOption("half");
    await page
      .getByRole("button", { name: "Tallenna pullo", exact: true })
      .click();
    await page
      .getByRole("button", { name: "2/4 jäljellä", exact: true })
      .click();
    await expect(page.locator(".bottle-card")).toHaveCount(1);
    await page.locator(".bottle-card").click();
    await page
      .getByRole("button", { name: "Siirrä arkistoon", exact: true })
      .click();
    await expect(page.locator(".bottle-card")).toHaveCount(0);
    await navigate(page, "Arkisto");
    await page.locator(".bottle-card").click();
    await page
      .getByRole("button", { name: "Palauta avaamattomana", exact: true })
      .click();
    await navigate(page, "Kokoelma");
    await page.locator(".bottle-card").click();
    await page.getByRole("button", { name: "Poista", exact: true }).click();
    await page.getByRole("button", { name: "Peruuta", exact: true }).click();
    await expect(page.locator(".detail-modal")).toBeVisible();
    await page.getByRole("button", { name: "Poista", exact: true }).click();
    await page
      .getByRole("button", { name: "Poista pullo", exact: true })
      .click();
    await expect(page.locator(".bottle-card")).toHaveCount(0);
  });
  test(`${device}: separate tasting groups and repeat sessions`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await navigate(page, "Maistelut");
    await addBottle(page, { tasting: true });
    await addBottle(page, { tasting: true, group: "Viskikerho" });
    await expect(page.locator(".bottle-card")).toHaveCount(2);
    await page
      .locator(".group-list")
      .getByRole("button", { name: /Islay-ilta/ })
      .click();
    await expect(page.locator(".bottle-card")).toHaveCount(1);
    await page.reload();
    await navigate(page, "Maistelut");
    await expect(page.locator(".bottle-card")).toHaveCount(2);
    await navigate(page, "Kokoelma");
    await expect(page.locator(".bottle-card")).toHaveCount(0);
  });
}

test("backup round trip preserves tasting groups, ratings, photos and notes", async ({
  page,
}) => {
  await page.goto("./");
  await addBottle(page, { photo: true });
  await navigate(page, "Maistelut");
  await addBottle(page, { tasting: true });
  await navigate(page, "Kokoelma");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Vie kokoelma", exact: true }).click();
  const download = await downloadPromise;
  const backup = await download.path();
  await page.locator(".bottle-card").click();
  await page.getByRole("button", { name: "Poista", exact: true }).click();
  await page.getByRole("button", { name: "Poista pullo", exact: true }).click();
  await page
    .getByRole("button", { name: "Tietoa & varmuuskopiointi", exact: false })
    .click();
  await page
    .locator('input[accept="application/json,.json"]')
    .setInputFiles(backup);
  await page.getByRole("button", { name: "Tuo pullot", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Tuodaanko varmuuskopio?" }),
  ).toHaveCount(0);
  await page
    .getByRole("dialog", { name: "Sinun kokoelmasi" })
    .getByRole("button", { name: "Sulje", exact: true })
    .click();
  await expect(page.locator(".bottle-card")).toHaveCount(1);
  await expect(page.locator(".bottle-card img")).toBeVisible();
  await page.locator(".bottle-card").click();
  await expect(
    page.getByText("Turvetta, suolaisuutta ja pitkä jälkimaku.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByLabel("Arvio 4/5 tähteä"),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sulje", exact: true })
    .click();
  await navigate(page, "Maistelut");
  await expect(page.locator(".bottle-card")).toHaveCount(1);
  await expect(
    page.locator(".group-list").getByRole("button", { name: /Islay-ilta/ }),
  ).toBeVisible();
});

test("installed app shell and records survive offline reload", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await addBottle(page);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        }),
      );
    return !!registration.active;
  });
  const manifest = await (
    await page.request.get("./manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe(process.env.VITE_BASE_PATH || "/");
  expect(manifest.scope).toBe(process.env.VITE_BASE_PATH || "/");
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  expect(manifest.icons.length).toBeGreaterThan(1);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".bottle-card")).toHaveCount(1);
  await page.locator(".bottle-card").click();
  await expect(
    page
      .getByRole("dialog", { name: "Pullon tarina" })
      .getByRole("heading", { name: "Port Charlotte", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("label photo is read locally and suggestions are editable before saving", async ({
  page,
}) => {
  test.setTimeout(120000);
  const external = [];
  page.on("request", (request) => {
    if (
      request.url().startsWith("http") &&
      !request.url().startsWith("http://127.0.0.1:4173")
    )
      external.push(request.url());
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Lisää pullo", exact: true }).click();
  await page
    .locator('input[accept="image/jpeg,image/png,image/webp"]')
    .setInputFiles("tests/fixtures/label.png");
  await expect(
    page.getByText("Tunnistetut ehdotukset", { exact: true }),
  ).toBeVisible({ timeout: 90000 });
  await page
    .getByRole("button", { name: "Käytä ehdotuksia", exact: true })
    .click();
  await expect(page.getByLabel("Tislaamo *", { exact: true })).toHaveValue(
    "Bruichladdich",
  );
  await expect(page.getByLabel("Tuotenimi", { exact: false })).toHaveValue(
    "Port Charlotte",
  );
  await expect(
    page.getByLabel("Alkoholipitoisuus", { exact: true }),
  ).toHaveValue("50");
  await expect(page.getByLabel("Pullon koko", { exact: true })).toHaveValue(
    "700",
  );
  await page
    .getByLabel("Tuotenimi", { exact: false })
    .fill("Port Charlotte 10");
  await page
    .getByRole("button", { name: "Tallenna pullo", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".bottle-card img")).toBeVisible();
  expect(external).toEqual([]);
});
