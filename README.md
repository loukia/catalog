# Whisky Catalog

Suomenkielinen viskikokoelma ja maistelupäiväkirja. React + Vite, paikallinen IndexedDB-tallennus ja laitteella toimiva Tesseract-tekstintunnistus. Ei käyttäjätiliä, palvelintietokantaa tai API-avaimia.

## Käynnistys

Node.js 22 tai 24 ja npm. Käytä olemassa olevaa hakemistoa `/workspace/catalog`.

```sh
npm ci
npm run dev
```

`npm ci` kopioi tunnistuksen worker-, WASM- ja kielitiedostot paikalliseen `public/ocr`-hakemistoon. Kielimalli kuuluu lukittuihin npm-riippuvuuksiin. Kuvia ei lähetetä palvelimelle. `public/ocr`, `node_modules` ja `dist` ovat generoituja; niitä ei tarvitse lisätä versionhallintaan.

```sh
npm test             # tietojen validointi, etiketin tulkinta ja varmuuskopiot
npm run build        # tuotantoversio ja offline-välimuisti
npm run preview      # tuotantoversion paikallinen tarkistus
npm run test:browser # kokoelman, maistelujen, OCR:n, varmuuskopion ja offline-tilan selainajot
```

Selainajot käyttävät tässä pilviympäristössä valmiiksi asennettua `/usr/bin/chromium`-selainta. Muualla voit asettaa `CHROMIUM_PATH`-muuttujan oman Chromium-asennuksesi poluksi. Testit käynnistävät tuotantoversion portissa 4173; tee build ennen ajoa. Testit käyttävät omia, eristettyjä selainprofiilejaan.

## Omat pullot ja maistelut

- Omat pullot: kuva, tislaamo, tuotenimi, alkoholipitoisuus, koko, alkuperämaa, ikä, ostopäivä, pullon tila, kommentit ja arvio 1–5 tähteä. Ostopäivä ehdottaa käyttäjän paikallista kuluvaa päivää.
- Pullon tilat: avaamaton, 3/4, 2/4, 1/4 ja arkistoitu. Arkistointi säilyttää kaikki tiedot.
- Maistelut: myös muiden pullot, nimetty tasting-ryhmä tai maisteluilta, maistelupäivä, huomiot ja oma arvio. Ryhmät syntyvät kirjoittamalla uusi nimi; aiemmat nimet ovat valittavissa. Jokainen maistelukerta on itsenäinen merkintä. Oman pullon näkymästä voi aloittaa uuden maistelun esitäytetyillä tuotetiedoilla.
- Haku, lajittelu, ryhmäsuodatus, muokkaus, poistamisen vahvistus ja JSON-varmuuskopio kuvineen.

Etiketin tunnistus käynnistyy kuvan valinnasta. Sovellus ehdottaa luettavasta tekstistä alkoholipitoisuutta, kokoa, ikää, alkuperää sekä tuntemiaan tislaamoita ja tuotenimiä. Käyttäjä tarkistaa ja hyväksyy ehdotukset ennen kenttien täyttämistä. Tämä on tekstintunnistus ja rajattu nimisanasto, ei kattava viskitietokanta tai täydellinen kuvantunnistus. Kaikki kentät voi täyttää käsin. Tuetut kuvat: JPG, PNG ja WebP, enintään 20 Mt; kuvat pienennetään tallennusta varten. iPhonen HEIC-kuva on tarvittaessa muunnettava tuettuun muotoon.

## Android ja iPhone

Käyttöliittymä mukautuu puhelimelle. Tuotantoversio on kotinäytölle lisättävä PWA-verkkosovellus:

- Android / Chrome: valikko → Asenna sovellus tai Lisää aloitusnäyttöön.
- iPhone / Safari: Jaa → Lisää Koti-valikkoon.

Julkaise `dist` tavallisessa **HTTPS**-staattisessa hosting-palvelussa. HTTPS tarvitaan asennukseen ja service workeriin muilla kuin localhost-osoitteilla. Tämä repositorio ei määritä tai julkaise hosting-palvelua. Kotinäyttöasennus pitää tarkistaa myös oikeilla Android- ja iPhone-laitteilla; pelkkä työpöytäselaimen puhelinkoko ei vahvista laitekohtaista toimintaa.

Ensimmäisen latauksen jälkeen käyttöliittymä ja tallennetut tiedot toimivat offline-tilassa. Tunnistuksen tiedostot ladataan ensimmäisellä tunnistuskerralla ja jäävät välimuistiin. Tunnistus offline-tilassa edellyttää näiden tiedostojen aiempaa latausta. Selain voi vapauttaa paikallista tallennustilaa.

**Tiedot ovat laite-, selain- ja verkko-osoitekohtaisia.** Puhelimen ja tietokoneen välillä ei ole automaattista synkronointia. Lataa säännöllisesti varmuuskopio kohdasta Tietoa & varmuuskopiointi. Varmuuskopion tuonti lisää puuttuvat merkinnät ja korvaa samat tunnisteet vasta vahvistuksen jälkeen; muut merkinnät säilyvät. Selaintietojen tyhjennys voi poistaa kokoelman. Varmuuskopio sisältää henkilökohtaiset kommentit ja kuvat.

## Julkaisu GitHub Pagesissa

Repositoriossa on automaattinen julkaisutyönkulku `.github/workflows/deploy-pages.yml`. Se asentaa riippuvuudet, ajaa testit ja julkaisee vain rakennetun `dist`-hakemiston. Käyttäjien paikalliset kuvat ja muistiinpanot eivät kuulu julkaisuun.

1. Vie projektin tiedostot GitHub-repositorion `loukia/catalog` `main`-haaraan. Älä lisää `node_modules`, `dist` tai generoituja `public/ocr`-tiedostoja versionhallintaan.
2. Avaa repositoriossa **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Avaa **Actions → Publish Whisky Catalog to GitHub Pages → Run workflow → main → Run workflow**. Myös uudet commitit `main`-haaraan käynnistävät julkaisun.
4. Odota, että sekä `build` että `deploy` onnistuvat. Julkaisuosoite näkyy työnkulun `deploy`-vaiheessa sekä Settings → Pages -sivulla. Repositorion oletusosoite on `https://loukia.github.io/catalog/`.
5. Avaa valmis HTTPS-osoite puhelimella ja lisää sovellus kotinäytölle yllä olevilla Android-/iPhone-ohjeilla.

GitHub Pagesin saatavuus yksityiselle repositoriolle riippuu GitHub-tilauksesta. Jos Pages ei ole käytettävissä, tarkista tilauksesi tai valitse erikseen, haluatko muuttaa lähdekoodirepositorion julkiseksi. Julkinen sovellus ei itsessään julkaise selaimeen tallennettuja pullotietoja. GitHub Pagesin sama `loukia.github.io`-alkuperä voi olla yhteinen muille saman tilin Pages-sivuille: paikallinen tallennus ei ole polun perusteella eristettyä. Älä sijoita samaan alkuperään epäluotettavia sivustoja.

GitHub Pagesin HTTPS-osoite on eri tallennuspaikka kuin kehitysympäristön osoite. Vie kehityksessä tallennetut pullot varmuuskopioksi ja tuo ne julkaistussa sovelluksessa. GitHub Actions ei tarvitse omia API-avaimia tai erillistä palvelintietokantaa; julkaisu käyttää GitHubin työnkululle antamia Pages-oikeuksia.

Julkaisutyönkulku asettaa `VITE_BASE_PATH`-arvoksi repositorion nimen mukaisen polun. Vastaavan version voi testata paikallisesti:

```sh
VITE_BASE_PATH=/catalog/ npm run build
VITE_BASE_PATH=/catalog/ npm run test:browser
```

Ilman muuttujaa paikallinen kehitys ja build toimivat juuripolussa `/`. Jos otat myöhemmin käyttöön oman verkkotunnuksen, muuta työnkulun `VITE_BASE_PATH` arvoksi `/` ja määritä tunnus GitHub Pagesin asetuksiin.
