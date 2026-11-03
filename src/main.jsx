import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  ArrowDownToLine,
  ArrowRight,
  Camera,
  Milk,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
  GlassWater,
  ImagePlus,
  Library,
  LoaderCircle,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wine,
  X,
} from "lucide-react";
import {
  emptyBottle,
  today,
  parseBackup,
  parseLabel,
  statusOf,
  statuses,
  validateBottle,
} from "./catalog.js";
import {
  deleteBottle,
  getBottles,
  importBottles,
  resizePhoto,
  saveBottle,
} from "./storage.js";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/libre-caslon-display/latin-400.css";
import "./style.css";

function BottleArt({ variant = 0, large = false }) {
  return (
    <svg
      className={`bottle-art ${large ? "large" : ""}`}
      viewBox="0 0 160 270"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`glass-${variant}`}
          x1="40"
          y1="100"
          x2="120"
          y2="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#344a35" />
          <stop offset=".35" stopColor="#617047" />
          <stop offset=".6" stopColor="#344a35" />
          <stop offset="1" stopColor="#1c3029" />
        </linearGradient>
        <linearGradient
          id={`amber-${variant}`}
          x1="40"
          y1="100"
          x2="120"
          y2="200"
        >
          <stop stopColor="#c99a47" />
          <stop offset="1" stopColor="#895d28" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="251" rx="45" ry="7" fill="#272b2420" />
      <path
        d="M65 30h30v50c0 15 26 22 27 45l3 108c0 17-90 17-90 0l3-108c1-23 27-30 27-45V30Z"
        fill={`url(#glass-${variant})`}
        stroke="#253e2c"
        strokeWidth="2"
      />
      <path
        d="M44 132h72l2 98c0 10-76 10-76 0Z"
        fill={`url(#amber-${variant})`}
        opacity=".24"
      />
      <path
        d="M47 121c0-16 21-26 25-35V44"
        stroke="#c4caa1"
        strokeWidth="4"
        opacity=".35"
      />
      <rect x="63" y="16" width="34" height="29" rx="3" fill="#e9e2c9" />
      <path d="M64 23h32M64 28h32M64 33h32" stroke="#b6af96" />
      <rect x="39" y="130" width="82" height="77" rx="2" fill="#f0e8cf" />
      <rect
        x="44"
        y="135"
        width="72"
        height="67"
        stroke="#9b957c"
        strokeWidth=".6"
      />
      <text
        x="80"
        y="153"
        textAnchor="middle"
        fill="#344034"
        fontFamily="Georgia"
        fontSize="7"
        letterSpacing="1.4"
      >
        THE WHISKY
      </text>
      <text
        x="80"
        y="172"
        textAnchor="middle"
        fill="#283a31"
        fontFamily="Georgia"
        fontSize="11"
      >
        COLLECTION
      </text>
      <path d="M62 181h36" stroke="#a9946c" />
      <text
        x="80"
        y="193"
        textAnchor="middle"
        fill="#71684e"
        fontFamily="Georgia"
        fontSize="6"
        letterSpacing="2"
      >
        SINGLE MALT
      </text>
      <path
        d="M55 218c8 4 43 4 51 0"
        stroke="#b4b89a"
        strokeWidth="2"
        opacity=".3"
      />
    </svg>
  );
}
function Stars({ value, onChange, small = false }) {
  return (
    <div
      className={`stars ${small ? "small" : ""}`}
      role={onChange ? "group" : undefined}
      aria-label={value ? `Arvio ${value}/5 tähteä` : "Ei vielä arviota"}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} ${n === 1 ? "tähti" : "tähteä"}`}
            aria-pressed={value === n}
            onClick={() => onChange(value === n ? 0 : n)}
          >
            <Star fill={n <= value ? "currentColor" : "none"} />
          </button>
        ) : (
          <Star
            key={n}
            fill={n <= value ? "currentColor" : "none"}
            className={n <= value ? "" : "unfilled"}
          />
        ),
      )}
    </div>
  );
}
function App() {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("collection");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState("newest");
  const [editor, setEditor] = useState(null);
  const [detail, setDetail] = useState(null);
  const [help, setHelp] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const importInput = useRef();
  useEffect(() => {
    getBottles()
      .then(setBottles)
      .catch(() =>
        setError(
          "Kokoelman lataus ei onnistunut. Tarkista, että selaimen paikallinen tallennus on sallittu.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const active = bottles.filter(
    (b) => b.kind !== "tasting" && b.status !== "archived",
  );
  const tastings = bottles.filter((b) => b.kind === "tasting");
  const groups = [...new Set(tastings.map((b) => b.tastingGroup))].sort(
    (a, b) => a.localeCompare(b, "fi"),
  );
  const addEntry = () =>
    setEditor({
      ...emptyBottle(view === "tastings" ? "tasting" : "bottle"),
      tastingGroup: view === "tastings" && group !== "all" ? group : "",
    });
  const archived = bottles.filter(
    (b) => b.kind !== "tasting" && b.status === "archived",
  );
  const rated = (view === "tastings" ? tastings : active).filter(
    (b) => b.rating > 0,
  );
  const filtered = (
    view === "archive" ? archived : view === "tastings" ? tastings : active
  )
    .filter(
      (b) =>
        (view !== "tastings" || group === "all" || b.tastingGroup === group) &&
        (filter === "all" || b.status === filter) &&
        `${b.name} ${b.distillery} ${b.country} ${b.comments}`
          .toLocaleLowerCase("fi")
          .includes(search.toLocaleLowerCase("fi")),
    )
    .sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : sort === "name"
          ? a.name.localeCompare(b.name, "fi")
          : (b.createdAt || "").localeCompare(a.createdAt || ""),
    );
  async function persist(bottle) {
    await saveBottle(bottle);
    setBottles((current) => [
      ...current.filter((b) => b.id !== bottle.id),
      bottle,
    ]);
    setEditor(null);
    setDetail(null);
    setNotice("Pullon tiedot tallennettu.");
  }
  async function changeStatus(bottle, status) {
    try {
      await persist({ ...bottle, status });
      setNotice(
        status === "archived"
          ? "Pullo siirretty arkistoon."
          : "Pullo palautettu kokoelmaan.",
      );
    } catch {
      setError("Tallennus ei onnistunut. Tietoja ei muutettu.");
    }
  }
  function exportBackup() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "whisky-catalog",
            version: 1,
            exportedAt: new Date().toISOString(),
            bottles,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `whisky-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setNotice("Varmuuskopio ladattu. Mukana ovat myös pullokuvat.");
  }
  async function readBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 100 * 1024 * 1024)
        throw new Error("Varmuuskopion enimmäiskoko on 100 Mt.");
      const incoming = parseBackup(JSON.parse(await file.text()));
      const overlaps = incoming.filter((b) =>
        bottles.some((existing) => existing.id === b.id),
      ).length;
      setConfirm({
        title: "Tuodaanko varmuuskopio?",
        text: `Tiedostossa on ${incoming.length} pulloa. ${overlaps ? `${overlaps} nykyisen pullon tiedot korvataan tiedoston tiedoilla.` : "Nykyiset pullot säilytetään."}`,
        action: "Tuo pullot",
        run: async () => {
          await importBottles(incoming);
          setBottles(await getBottles());
          setNotice(`${incoming.length} pulloa tuotu kokoelmaan.`);
        },
      });
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Tiedostoa ei voitu lukea. Valitse JSON-varmuuskopio."
          : e.message,
      );
    }
  }
  function navigate(next) {
    setView(next);
    setFilter("all");
    setGroup("all");
    setSearch("");
    setMobileNav(false);
  }
  return (
    <div className="app-shell">
      {mobileNav && (
        <div className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("collection");
          }}
        >
          <span className="brand-icon">
            <GlassWater size={29} strokeWidth={1.3} />
          </span>
          <span>
            WHISKY<span className="brand-bottom">CATALOG</span>
          </span>
        </a>
        <div className="sidebar-rule" />
        <div className="nav-label">OMA VISKIMAAILMASI</div>
        <nav>
          <button
            className={view === "collection" ? "active" : ""}
            onClick={() => navigate("collection")}
          >
            <Library size={19} />
            Kokoelma<span className="nav-count">{active.length}</span>
          </button>
          <button
            className={view === "tastings" ? "active" : ""}
            onClick={() => navigate("tastings")}
          >
            <Wine size={19} />
            Maistelut<span className="nav-count">{tastings.length}</span>
          </button>
          <button
            className={view === "archive" ? "active" : ""}
            onClick={() => navigate("archive")}
          >
            <Archive size={19} />
            Arkisto<span className="nav-count">{archived.length}</span>
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="note-line" />
          <p>
            Jokaisella pullolla
            <br />
            on oma tarinansa.
          </p>
          <span className="note-attribution">SÄILYTÄ OMASI.</span>
          <BottleArt variant="sidebar" />
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            Tietoa & varmuuskopiointi
            <ChevronRight size={15} />
          </button>
          <div className="profile">
            <span className="avatar">O</span>
            <div>
              Oma kokoelma<small>Henkilökohtainen viskipäiväkirja</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Avaa valikko"
            onClick={() => setMobileNav(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Oma viskimaailmasi
            <ChevronRight size={14} />
            <span>
              {view === "archive"
                ? "Arkisto"
                : view === "tastings"
                  ? "Maistelut"
                  : "Kokoelma"}
            </span>
          </div>
          <span className="private-label">
            <ShieldCheck size={15} /> Vain sinulle
          </span>
          <button
            className="top-avatar"
            onClick={() => setHelp(true)}
            aria-label="Kokoelman tallennustiedot"
          >
            O
          </button>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">OMA KOKOELMASI, OMA TARINASI</div>
              <h1>
                {view === "archive"
                  ? "Muistoja lasin pohjalta."
                  : view === "tastings"
                    ? "Maisteltu. Muistettu."
                    : "Hyviä hetkiä pullotettuna."}
              </h1>
              <p>
                {view === "archive"
                  ? "Nautitut pullot ja niiden tarinat tallessa."
                  : view === "tastings"
                    ? "Maisteluillat, uudet löydöt ja omat huomiot — myös muiden pulloista."
                    : "Kaikki viskisi, muistiinpanosi ja löytösi yhdessä paikassa."}
              </p>
            </div>
            <button className="button primary" onClick={() => addEntry()}>
              <Plus size={19} />
              {view === "tastings" ? "Lisää maistelu" : "Lisää pullo"}
            </button>
          </div>
          <section className="stats" aria-label="Kokoelman yhteenveto">
            {view === "tastings" ? (
              <>
                <Stat
                  icon={<Wine />}
                  label="Maistelukertoja"
                  value={tastings.length}
                  foot="Jokainen kerta oma tarinansa"
                />
                <Stat
                  icon={<Library />}
                  label="Tasting-ryhmiä"
                  value={groups.length}
                  foot="Yhdessä tai omin päin"
                />
                <Stat
                  icon={<Star />}
                  label="Maistelujen keskiarvo"
                  value={
                    rated.length
                      ? (
                          rated.reduce((sum, b) => sum + b.rating, 0) /
                          rated.length
                        ).toLocaleString("fi", {
                          maximumFractionDigits: 1,
                          minimumFractionDigits: 1,
                        })
                      : "—"
                  }
                  foot={`${rated.length} arvioitua maistelua`}
                />
                <Stat
                  icon={<Milk />}
                  label="Eri viskejä maisteltu"
                  value={
                    new Set(
                      tastings.map(
                        (b) =>
                          `${b.distillery.trim().toLowerCase()}|${b.name.trim().toLowerCase()}`,
                      ),
                    ).size
                  }
                  foot="Uusia makuja, uusia löytöjä"
                />
              </>
            ) : (
              <>
                <Stat
                  icon={<Milk />}
                  label="Pulloja kokoelmassa"
                  value={active.length}
                  foot="Jokainen oma löytönsä"
                />
                <Stat
                  icon={<GlassWater />}
                  label="Avattuja pulloja"
                  value={active.filter((b) => b.status !== "unopened").length}
                  foot="Valmiina nautittavaksi"
                />
                <Stat
                  icon={<Star />}
                  label="Oma keskiarvo"
                  value={
                    rated.length
                      ? (
                          rated.reduce((sum, b) => sum + b.rating, 0) /
                          rated.length
                        ).toLocaleString("fi", {
                          maximumFractionDigits: 1,
                          minimumFractionDigits: 1,
                        })
                      : "—"
                  }
                  foot={
                    rated.length
                      ? `${rated.length} arvioitua viskiä`
                      : "Arviot kertovat maustasi"
                  }
                />
                <Stat
                  icon={<Archive />}
                  label="Arkistoituja pulloja"
                  value={archived.length}
                  foot="Hyvät muistot säilyvät"
                />
              </>
            )}
          </section>
          {view === "collection" && (
            <section className="collection-banner">
              <div className="banner-copy">
                <span className="eyebrow">PIENI RITUAALI. SUURI TARINA.</span>
                <h2>Enemmän kuin kokoelma.</h2>
                <p>
                  Ensimmäinen tuoksu, viimeinen tilkka.
                  <br />
                  Tallenna ne hetket, jotka tekevät viskistäsi sinun.
                </p>
                <button onClick={() => addEntry()}>
                  Tallenna seuraava löytösi
                  <ArrowRight size={17} />
                </button>
              </div>
              <div className="banner-art" aria-hidden="true">
                <div className="art-circle" />
                <div className="art-circle second" />
                <div className="art-label">
                  THE GOOD
                  <br />
                  <span>SPIRIT</span>
                  <i>of collecting</i>
                </div>
                <BottleArt variant="hero" large />
                <div className="glass-drawing">
                  <span />
                  <i />
                </div>
                <span className="art-spark">✦</span>
              </div>
            </section>
          )}
          <section className="collection-section">
            <div className="section-title">
              <h2>
                {view === "archive"
                  ? "Arkistoidut pullot"
                  : view === "tastings"
                    ? "Maistelupäiväkirja"
                    : "Viskikokoelmasi"}
                <span>
                  {view === "archive"
                    ? archived.length
                    : view === "tastings"
                      ? tastings.length
                      : active.length}
                </span>
              </h2>
              <button className="text-button" onClick={exportBackup}>
                <Download size={15} />
                Vie kokoelma
              </button>
            </div>
            {view === "tastings" && (
              <div className="group-list" aria-label="Tasting-ryhmät">
                <button
                  className={group === "all" ? "selected" : ""}
                  onClick={() => setGroup("all")}
                >
                  <Wine size={15} />
                  Kaikki maistelut <span>{tastings.length}</span>
                </button>
                {groups.map((g) => (
                  <button
                    className={group === g ? "selected" : ""}
                    key={g}
                    onClick={() => setGroup(g)}
                  >
                    {g}
                    <span>
                      {tastings.filter((b) => b.tastingGroup === g).length}
                    </span>
                  </button>
                ))}
                <button className="new-group" onClick={addEntry}>
                  <Plus size={15} />
                  Uusi maistelu / ryhmä
                </button>
              </div>
            )}
            <div className="toolbar">
              <div className="tabs">
                <button
                  className={filter === "all" ? "selected" : ""}
                  onClick={() => setFilter("all")}
                >
                  {view === "tastings" ? "Maistelumerkinnät" : "Kaikki pullot"}
                </button>
                {view === "collection" && (
                  <>
                    <button
                      className={filter === "unopened" ? "selected" : ""}
                      onClick={() => setFilter("unopened")}
                    >
                      Avaamattomat
                    </button>
                    <button
                      className={filter === "half" ? "selected" : ""}
                      onClick={() => setFilter("half")}
                    >
                      2/4 jäljellä
                    </button>
                  </>
                )}
              </div>
              <div className="tools">
                <label className="search">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Etsi viskiä tai tislaamoa…"
                    aria-label="Etsi viskiä tai tislaamoa"
                  />
                  {search && (
                    <button
                      aria-label="Tyhjennä haku"
                      onClick={() => setSearch("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
                <label className="sort">
                  <SlidersHorizontal size={16} />
                  <select
                    aria-label="Järjestä pullot"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Uusimmat</option>
                    <option value="name">Nimen mukaan</option>
                    <option value="rating">Parhaat arviot</option>
                  </select>
                  <ChevronDown size={13} />
                </label>
              </div>
            </div>
            {loading ? (
              <div className="empty-state">
                <LoaderCircle className="spin" />
                <p>Ladataan kokoelmaa…</p>
              </div>
            ) : filtered.length ? (
              <div className="bottle-grid">
                {filtered.map((b) => (
                  <button
                    className="bottle-card"
                    key={b.id}
                    onClick={() => setDetail(b)}
                  >
                    <div className="card-image">
                      <span
                        className={`status-badge ${b.status === "unopened" ? "sealed" : ""}`}
                      >
                        <span />
                        {b.kind === "tasting"
                          ? b.tastingGroup
                          : statusOf(b.status).label}
                      </span>
                      {b.image ? (
                        <img src={b.image} alt={`${b.distillery} ${b.name}`} />
                      ) : (
                        <BottleArt variant={b.id} />
                      )}
                      <span className="card-open">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                    <div className="card-copy">
                      <span className="distillery-label">{b.distillery}</span>
                      <h3>{b.name}</h3>
                      <p>
                        {[
                          b.age && `${b.age} vuotta`,
                          b.abv && `${b.abv} %`,
                          b.volume && `${b.volume} ml`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Oma löytösi"}
                      </p>
                      <div className="card-footer">
                        <Stars value={b.rating} small />
                        <span>
                          {new Date(
                            `${b.kind === "tasting" ? b.tasted : b.purchased}T12:00:00`,
                          ).toLocaleDateString("fi-FI")}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
                <button className="add-card" onClick={() => addEntry()}>
                  <span>
                    <Plus size={25} />
                  </span>
                  <h3>Seuraava hyvä löytö</h3>
                  <p>
                    {view === "tastings"
                      ? "Kirjaa uusi maistelu"
                      : "Lisää pullo kokoelmaasi"}
                  </p>
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  {view === "archive" ? (
                    <Archive size={29} strokeWidth={1.3} />
                  ) : search || filter !== "all" ? (
                    <Search size={29} strokeWidth={1.3} />
                  ) : (
                    <Milk size={32} strokeWidth={1.3} />
                  )}
                </div>
                <span className="eyebrow">
                  {search || filter !== "all"
                    ? "ETSINTÄ JATKUU"
                    : "TÄSTÄ SE ALKAA"}
                </span>
                <h3>
                  {search || filter !== "all"
                    ? "Näillä ehdoilla ei löytynyt pulloja"
                    : view === "archive"
                      ? "Tarinoita kertyy ajan kanssa"
                      : view === "tastings"
                        ? "Jokainen maistelu on uusi löytö."
                        : "Ensimmäinen pullo, ensimmäinen tarina."}
                </h3>
                <p>
                  {search || filter !== "all"
                    ? "Kokeile toista hakusanaa tai näytä kaikki pullot."
                    : view === "archive"
                      ? "Siirrä nautitut pullot arkistoon. Kommentit ja arviot säilyvät."
                      : view === "tastings"
                        ? "Lisää maisteltu viski ja nimeä tasting-ryhmä tai maisteluilta."
                        : "Nappaa kuva etiketistä ja lisää ensimmäinen viskisi kokoelmaan."}
                </p>
                {search || filter !== "all" ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                  >
                    Tyhjennä suodattimet
                  </button>
                ) : (
                  view !== "archive" && (
                    <button
                      className="button primary"
                      onClick={() => addEntry()}
                    >
                      <Plus size={17} />
                      {view === "tastings"
                        ? "Lisää ensimmäinen maistelu"
                        : "Lisää ensimmäinen pullo"}
                    </button>
                  )
                )}
                <span className="empty-bottom">
                  <ShieldCheck size={13} />
                  Kokoelmasi tallentuu vain tähän selaimeen.
                </span>
              </div>
            )}
          </section>
          <footer className="page-footer">
            <span>
              <GlassWater size={15} />
              WHISKY CATALOG
            </span>
            <p>Kerää harkiten. Nauti hetkestä.</p>
            <button onClick={() => setHelp(true)}>
              Omat tiedot & varmuuskopiointi
              <ArrowRight size={13} />
            </button>
          </footer>
        </main>
      </div>
      {editor && (
        <BottleEditor
          groups={groups}
          bottle={editor}
          onClose={() => setEditor(null)}
          onSave={persist}
        />
      )}
      {detail && (
        <Modal
          title="Pullon tarina"
          onClose={() => setDetail(null)}
          className="detail-modal"
        >
          <div className="detail-hero">
            {detail.image ? (
              <img
                src={detail.image}
                alt={`${detail.distillery} ${detail.name}`}
              />
            ) : (
              <BottleArt variant="detail" />
            )}
            <span className="status-badge">
              {detail.kind === "tasting"
                ? detail.tastingGroup
                : statusOf(detail.status).label}
            </span>
          </div>
          <div className="detail-content">
            <div className="eyebrow">{detail.distillery}</div>
            <h2>{detail.name}</h2>
            <Stars value={detail.rating} />
            <dl>
              {[
                [
                  "Alkoholipitoisuus",
                  detail.abv ? `${detail.abv} %` : "Ei tiedossa",
                ],
                [
                  "Pullon koko",
                  detail.volume ? `${detail.volume} ml` : "Ei tiedossa",
                ],
                [
                  detail.kind === "tasting" ? "Maistelupäivä" : "Ostopäivä",
                  new Date(
                    `${detail.kind === "tasting" ? detail.tasted : detail.purchased}T12:00:00`,
                  ).toLocaleDateString("fi-FI"),
                ],
                ["Alkuperä", detail.country || "Ei tiedossa"],
                [
                  "Ikä",
                  detail.age ? `${detail.age} vuotta` : "Ei ikämerkintää",
                ],
              ].map(([key, val]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
            <h3>Omat muistiinpanot</h3>
            <p className="detail-notes">
              {detail.comments ||
                "Tämän pullon tarina odottaa vielä ensimmäistä muistiinpanoa."}
            </p>
            <button
              className="button primary full"
              onClick={() => {
                setEditor(detail);
                setDetail(null);
              }}
            >
              <Settings2 size={16} />
              Muokkaa pullon tietoja
            </button>
            <button
              className="button secondary full log-tasting"
              onClick={() => {
                setEditor({
                  ...detail,
                  id: undefined,
                  createdAt: undefined,
                  kind: "tasting",
                  tastingGroup: "",
                  tasted: today(),
                  rating: 0,
                  comments: "",
                });
                setDetail(null);
              }}
            >
              <Wine size={16} />
              Kirjaa uusi maistelu tästä viskistä
            </button>
            <div className="detail-actions">
              {detail.kind !== "tasting" && (
                <button
                  onClick={() =>
                    changeStatus(
                      detail,
                      detail.status === "archived" ? "unopened" : "archived",
                    )
                  }
                >
                  <Archive size={16} />
                  {detail.status === "archived"
                    ? "Palauta avaamattomana"
                    : "Siirrä arkistoon"}
                </button>
              )}
              <button
                className="danger-text"
                onClick={() =>
                  setConfirm({
                    title: "Poistetaanko pullo?",
                    text: `${detail.name} poistetaan pysyvästi kuvineen ja muistiinpanoineen.`,
                    action: "Poista pullo",
                    danger: true,
                    run: async () => {
                      await deleteBottle(detail.id);
                      setBottles((current) =>
                        current.filter((b) => b.id !== detail.id),
                      );
                      setDetail(null);
                      setNotice("Pullo poistettu.");
                    },
                  })
                }
              >
                <Trash2 size={16} />
                Poista
              </button>
            </div>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="Sinun kokoelmasi" onClose={() => setHelp(false)}>
          <div className="help-content">
            <div className="help-icon">
              <ShieldCheck size={30} />
            </div>
            <h2>Omat pullot. Omassa tallessa.</h2>
            <p>
              Whisky Catalog tallentaa pullot, kuvat ja muistiinpanot tämän
              laitteen tähän selaimeen. Et tarvitse käyttäjätiliä. Tiedot eivät
              siirry automaattisesti muihin selaimiin tai laitteisiin.
            </p>
            <div className="info-box">
              Lataa varmuuskopio säännöllisesti. Selaintietojen poistaminen tai
              yksityisen selausikkunan sulkeminen voi poistaa kokoelmasi.
            </div>
            <h3>Puhelimella</h3>
            <p>
              Android: avaa sovellus Chromessa ja valitse valikosta Asenna
              sovellus tai Lisää aloitusnäyttöön. iPhone: avaa Safarissa,
              valitse Jaa ja Lisää Koti-valikkoon. Asennus ja offline-käyttö
              edellyttävät HTTPS-osoitetta. Ladattu sovellus toimii myös ilman
              verkkoyhteyttä; etiketin tunnistus tarvitsee ensimmäisellä
              käyttökerralla tunnistustiedostot.
            </p>
            <h3>Maistelut ja tasting-ryhmät</h3>
            <p>
              Maistelut-osioon voit kirjata myös viskit, joita et omista. Nimeä
              ryhmä tai maisteluilta ja lisää päivä, huomiot sekä arvio. Kirjaa
              jokainen maistelukerta erikseen: näin saman viskin arviot eri
              kerroilta säilyvät.
            </p>
            <h3>Varmuuskopiointi</h3>
            <p>
              Varmuuskopio sisältää kaikki pullot ja kuvat. Voit tuoda sen
              takaisin tai siirtää kokoelman toiselle laitteelle.
            </p>
            <button className="button primary full" onClick={exportBackup}>
              <ArrowDownToLine size={17} />
              Lataa varmuuskopio ({bottles.length} pulloa)
            </button>
            <button
              className="button secondary full"
              onClick={() => importInput.current.click()}
            >
              <Upload size={17} />
              Tuo varmuuskopio
            </button>
            <h3>Etiketin tunnistus</h3>
            <p>
              Kuvan tekstintunnistus tapahtuu laitteellasi. Se ehdottaa
              luettavasta etiketistä tislaamoa, tunnettuja tuotenimiä,
              alkoholipitoisuutta ja pullokokoa. Tarkista ehdotukset: valaistus,
              kaareva etiketti ja kirjasintyyli vaikuttavat tunnistukseen.
            </p>
            <p className="muted">
              Tunnistus ei hae ulkoista viskitietokantaa eikä täydennä puuttuvia
              tietoja arvaamalla.
            </p>
          </div>
        </Modal>
      )}
      <input
        hidden
        type="file"
        accept="application/json,.json"
        ref={importInput}
        onChange={readBackup}
      />
      {confirm && (
        <Modal
          title={confirm.title}
          onClose={() => !busy && setConfirm(null)}
          className="confirm-modal"
        >
          <div className="confirm-content">
            <p>{confirm.text}</p>
            <div className="confirm-actions">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setConfirm(null)}
              >
                Peruuta
              </button>
              <button
                className={`button ${confirm.danger ? "danger" : "primary"}`}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await confirm.run();
                    setConfirm(null);
                  } catch {
                    setError(
                      "Toiminto epäonnistui. Tarkista selaimen tallennustila ja yritä uudelleen.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy && <LoaderCircle className="spin" size={16} />}{" "}
                {confirm.action}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <button aria-label="Sulje ilmoitus" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="toast error" role="alert">
          {error}
          <button aria-label="Sulje virhe" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function Stat({ icon, label, value, foot }) {
  return (
    <article className="stat">
      <div>
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{foot}</p>
    </article>
  );
}
const modalStack = [];
let originalBodyOverflow = "";
function Modal({ title, onClose, children, className = "" }) {
  const ref = useRef();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    if (!modalStack.length) originalBodyOverflow = document.body.style.overflow;
    modalStack.push(ref.current);
    for (const modal of modalStack) modal.inert = modal !== ref.current;
    document.body.style.overflow = "hidden";
    const root = document.querySelector(".main-shell");
    const sidebar = document.querySelector(".sidebar");
    root.inert = true;
    sidebar.inert = true;
    ref.current.focus();
    function keydown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab") {
        const focusable = [
          ...ref.current.querySelectorAll(
            'button, input, select, textarea, [tabindex="0"]',
          ),
        ].filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focusable.length) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    ref.current.addEventListener("keydown", keydown);
    const el = ref.current;
    return () => {
      el.removeEventListener("keydown", keydown);
      modalStack.splice(modalStack.indexOf(el), 1);
      for (const modal of modalStack) modal.inert = modal !== modalStack.at(-1);
      document.body.style.overflow = modalStack.length
        ? "hidden"
        : originalBodyOverflow;
      root.inert = modalStack.length > 0;
      sidebar.inert = modalStack.length > 0;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  const titleId = React.useId();
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${className}`}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-header">
          <span id={titleId}>{title}</span>
          <button className="icon-button" onClick={onClose} aria-label="Sulje">
            <X size={21} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function BottleEditor({ bottle, onClose, onSave, groups = [] }) {
  const [form, setForm] = useState({
    kind: "bottle",
    tasted: bottle.purchased,
    tastingGroup: "",
    ...bottle,
  });
  const [saving, setSaving] = useState(false);
  const [ocr, setOcr] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInput = useRef();
  const cameraInput = useRef();
  const worker = useRef();
  const cancelled = useRef(false);
  useEffect(
    () => () => {
      cancelled.current = true;
      worker.current?.terminate();
    },
    [],
  );
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  async function selectPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      const image = await resizePhoto(file);
      update("image", image);
      setSuggestions(null);
      setOcrText("");
      await recognize(image);
    } catch (e) {
      setError(e.message);
    } finally {
      setPhotoBusy(false);
    }
  }
  async function recognize(image = form.image) {
    setError("");
    setSuggestions(null);
    setOcr({ text: "Valmistellaan tunnistusta…", progress: 0 });
    cancelled.current = false;
    try {
      const { createWorker } = await import("tesseract.js");
      if (cancelled.current) return;
      const instance = await createWorker("eng", 1, {
        workerPath: `${location.origin}${import.meta.env.BASE_URL}ocr/worker.min.js`,
        corePath: `${location.origin}${import.meta.env.BASE_URL}ocr/core`,
        langPath: `${location.origin}${import.meta.env.BASE_URL}ocr/lang`,
        logger: (message) => {
          if (!cancelled.current)
            setOcr({
              text:
                message.status === "recognizing text"
                  ? "Luetaan etikettiä…"
                  : "Valmistellaan tunnistusta…",
              progress: Math.round((message.progress || 0) * 100),
            });
        },
      });
      if (cancelled.current) {
        await instance.terminate();
        return;
      }
      worker.current = instance;
      const result = await instance.recognize(image);
      if (cancelled.current) return;
      setOcrText(result.data.text);
      const fields = parseLabel(result.data.text);
      setSuggestions(fields);
      if (!Object.keys(fields).length)
        setError(
          "Etiketistä ei löytynyt varmoja tietoja. Kokeile lähempää otettua, tarkkaa kuvaa tai täytä tiedot itse.",
        );
    } catch {
      if (!cancelled.current)
        setError(
          "Kuvan tunnistus ei onnistunut. Voit kokeilla uudelleen tai täyttää tiedot itse.",
        );
    } finally {
      await worker.current?.terminate();
      worker.current = null;
      if (!cancelled.current) setOcr(null);
    }
  }
  const close = () => {
    if (!saving) onClose();
  };
  return (
    <Modal
      title={bottle.id ? "Muokkaa pulloa" : "Uusi pullo kokoelmaan"}
      onClose={close}
      className="editor-modal"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const validation = validateBottle(form);
          if (validation) {
            setError(validation);
            return;
          }
          setSaving(true);
          setError("");
          try {
            await onSave({
              ...form,
              tastingGroup: form.tastingGroup.trim(),
              name: form.name.trim(),
              distillery: form.distillery.trim(),
              id: form.id || crypto.randomUUID(),
              createdAt: form.createdAt || new Date().toISOString(),
            });
          } catch {
            setError(
              "Tallennus ei onnistunut. Selaimen tallennustila voi olla täynnä. Ota varmuuskopio ja vapauta tilaa.",
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="editor-body">
          <div className="editor-intro">
            <div className="eyebrow">UUSI LÖYTÖ, UUSI TARINA</div>
            <h2>
              {bottle.id ? "Tarinasi jatkuu." : "Mitä lasiin seuraavaksi?"}
            </h2>
            <p>Lisää kuva ja tallenna pullosi tiedot.</p>
          </div>
          <div className="photo-section">
            <button
              type="button"
              className={`photo-upload ${form.image ? "has-image" : ""}`}
              onClick={() => photoInput.current.click()}
              disabled={!!ocr || photoBusy}
              aria-label={
                form.image ? "Vaihda pullon kuva" : "Lisää pullon kuva"
              }
            >
              {form.image ? (
                <img src={form.image} alt="Valittu pullon kuva" />
              ) : (
                <>
                  <ImagePlus size={30} strokeWidth={1.4} />
                  <strong>
                    {photoBusy ? "Käsitellään kuvaa…" : "Lisää kuva pullosta"}
                  </strong>
                  <span>JPG, PNG tai WebP · enintään 20 Mt</span>
                </>
              )}{" "}
              {form.image && (
                <span className="change-photo">
                  <ImagePlus size={15} />
                  Vaihda kuva
                </span>
              )}
            </button>
            <input
              hidden
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectPhoto}
            />
            <input
              hidden
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={selectPhoto}
            />
            <div className="recognition-info">
              <span className="recognition-icon">
                <Sparkles size={21} />
              </span>
              <h3>Etiketti auttaa alkuun</h3>
              <button
                type="button"
                className="text-button camera-button"
                disabled={!!ocr || photoBusy}
                onClick={() => cameraInput.current.click()}
              >
                <Camera size={16} />
                Ota kuva kameralla
              </button>
              <p>
                Tunnistus käynnistyy kuvan lisäämisen jälkeen. Se etsii
                tislaamon, tuotenimen, vahvuuden ja pullokoon. Tarkista
                ehdotukset ennen käyttöä.
              </p>
              <button
                type="button"
                className="button secondary"
                disabled={!form.image || !!ocr || photoBusy}
                onClick={recognize}
              >
                {ocr ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}{" "}
                {ocr ? `${ocr.text} ${ocr.progress}%` : "Tunnista etiketistä"}
              </button>
              <small>Kuva käsitellään vain tällä laitteella.</small>
              {form.image && !ocr && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    update("image", "");
                    setSuggestions(null);
                    setOcrText("");
                  }}
                >
                  Poista kuva
                </button>
              )}
            </div>
          </div>
          {suggestions && Object.keys(suggestions).length > 0 && (
            <div className="suggestions">
              <div>
                <Sparkles size={17} />
                <strong>Tunnistetut ehdotukset</strong>
              </div>
              <p>
                {Object.entries(suggestions)
                  .map(
                    ([key, val]) =>
                      `${{ distillery: "Tislaamo", name: "Tuotenimi", abv: "Vahvuus (%)", volume: "Koko (ml)", age: "Ikä", country: "Alkuperä" }[key]}: ${val}`,
                  )
                  .join(" · ")}
              </p>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setForm((f) => ({ ...f, ...suggestions }));
                  setSuggestions(null);
                }}
              >
                Käytä ehdotuksia
              </button>
              <small>
                Ehdotukset korvaavat vastaavien kenttien nykyiset tiedot.
              </small>
            </div>
          )}
          {ocrText && (
            <details className="ocr-text">
              <summary>Näytä etiketistä luettu teksti</summary>
              <pre>{ocrText}</pre>
            </details>
          )}
          <div
            className="entry-type"
            role="group"
            aria-label="Merkinnän tyyppi"
          >
            <button
              type="button"
              className={form.kind === "bottle" ? "selected" : ""}
              onClick={() => update("kind", "bottle")}
            >
              <Milk size={17} />
              Oma pullo
            </button>
            <button
              type="button"
              className={form.kind === "tasting" ? "selected" : ""}
              onClick={() => update("kind", "tasting")}
            >
              <Wine size={17} />
              Maistelu
            </button>
          </div>
          {form.kind === "tasting" && (
            <div className="tasting-fields">
              <Field label="Tasting-ryhmä tai maisteluilta" required>
                <input
                  required
                  maxLength={100}
                  list="tasting-groups"
                  value={form.tastingGroup}
                  onChange={(e) => update("tastingGroup", e.target.value)}
                  placeholder="Esim. Viskikerho · Islay-ilta"
                />
              </Field>
              <datalist id="tasting-groups">
                {groups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              <p>
                Valitse aiempi ryhmä tai kirjoita uusi. Pulloa ei lisätä omaan
                kokoelmaan.
              </p>
            </div>
          )}
          <div className="form-section-label">
            <span>01</span>PULLON TIEDOT
          </div>
          <div className="form-grid">
            <Field label="Tislaamo" required>
              <input
                required
                maxLength={200}
                value={form.distillery}
                onChange={(e) => update("distillery", e.target.value)}
                placeholder="Esim. Bruichladdich"
                autoComplete="off"
              />
            </Field>
            <Field label="Tuotenimi" required>
              <input
                required
                maxLength={200}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Esim. Port Charlotte"
                autoComplete="off"
              />
            </Field>
            <Field label="Alkoholipitoisuus" suffix="%">
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.01"
                value={form.abv}
                onChange={(e) => update("abv", e.target.value)}
                placeholder="50"
              />
            </Field>
            <Field label="Pullon koko" suffix="ml">
              <input
                type="number"
                min="1"
                max="100000"
                value={form.volume}
                onChange={(e) => update("volume", e.target.value)}
                placeholder="700"
              />
            </Field>
            <Field label="Alkuperämaa">
              <input
                maxLength={100}
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="Esim. Skotlanti"
              />
            </Field>
            <Field label="Ikä" suffix="vuotta">
              <input
                type="number"
                min="0"
                max="150"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="Ei ikämerkintää"
              />
            </Field>
          </div>
          <div className="form-section-label">
            <span>02</span>OMAN PULLON TARINA
          </div>
          <div className="form-grid">
            <Field
              label={form.kind === "tasting" ? "Maistelupäivä" : "Ostopäivä"}
              required
            >
              <input
                required
                type="date"
                value={form.kind === "tasting" ? form.tasted : form.purchased}
                onChange={(e) =>
                  update(
                    form.kind === "tasting" ? "tasted" : "purchased",
                    e.target.value,
                  )
                }
              />
            </Field>
            {form.kind !== "tasting" && (
              <Field label="Pullon tila">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {statuses.map((s) => (
                    <option value={s.value} key={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          {form.kind !== "tasting" && form.status === "archived" && (
            <p className="field-hint">
              Pullo näkyy arkistossa. Kuvasi, kommenttisi ja arviosi säilyvät.
            </p>
          )}
          <div className="rating-field">
            <span>Oma arvio</span>
            <Stars
              value={form.rating}
              onChange={(value) => update("rating", value)}
            />
            <small>
              {form.rating
                ? `${form.rating}/5 tähteä · poista painamalla valittua tähteä`
                : "Miltä maistui? Voit arvioida myös myöhemmin."}
            </small>
          </div>
          <Field label="Omat kommentit">
            <textarea
              rows="4"
              maxLength={10000}
              value={form.comments}
              onChange={(e) => update("comments", e.target.value)}
              placeholder="Tuoksu, maku, jälkimaku — tai se hetki, joka jäi mieleen."
            />
          </Field>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="editor-footer">
          <span>* Pakolliset tiedot</span>
          <button
            className="button secondary"
            type="button"
            disabled={saving}
            onClick={close}
          >
            Peruuta
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={saving || !!ocr || photoBusy}
          >
            {saving ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Check size={17} />
            )}{" "}
            {form.kind === "tasting" ? "Tallenna maistelu" : "Tallenna pullo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Field({ label, children, suffix, required }) {
  const id = React.useId();
  return (
    <div className={`field ${suffix ? "with-suffix" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span> *</span>}
      </label>
      <div className="input-wrap">
        {React.cloneElement(children, { id })}
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
