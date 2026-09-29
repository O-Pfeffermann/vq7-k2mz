/* Service worker — precaches the app shell; map data parts are stored by the page.
   Build replaces the three placeholders below. */
const VERSION = "e91d4d9dd681";
const PRECACHE = ["./", "app.css", "app.js", "assets/fonts/Noto%20Sans%20Italic/0-255.pbf", "assets/fonts/Noto%20Sans%20Italic/256-511.pbf", "assets/fonts/Noto%20Sans%20Italic/512-767.pbf", "assets/fonts/Noto%20Sans%20Italic/768-1023.pbf", "assets/fonts/Noto%20Sans%20Italic/8192-8447.pbf", "assets/fonts/Noto%20Sans%20Italic/8448-8703.pbf", "assets/fonts/Noto%20Sans%20Italic/9472-9727.pbf", "assets/fonts/Noto%20Sans%20Medium/0-255.pbf", "assets/fonts/Noto%20Sans%20Medium/256-511.pbf", "assets/fonts/Noto%20Sans%20Medium/512-767.pbf", "assets/fonts/Noto%20Sans%20Medium/768-1023.pbf", "assets/fonts/Noto%20Sans%20Medium/8192-8447.pbf", "assets/fonts/Noto%20Sans%20Medium/8448-8703.pbf", "assets/fonts/Noto%20Sans%20Medium/9472-9727.pbf", "assets/fonts/Noto%20Sans%20Regular/0-255.pbf", "assets/fonts/Noto%20Sans%20Regular/256-511.pbf", "assets/fonts/Noto%20Sans%20Regular/512-767.pbf", "assets/fonts/Noto%20Sans%20Regular/768-1023.pbf", "assets/fonts/Noto%20Sans%20Regular/8192-8447.pbf", "assets/fonts/Noto%20Sans%20Regular/8448-8703.pbf", "assets/fonts/Noto%20Sans%20Regular/9472-9727.pbf", "assets/sprites/v4/dark.json", "assets/sprites/v4/dark.png", "assets/sprites/v4/dark%402x.json", "assets/sprites/v4/dark%402x.png", "assets/sprites/v4/light.json", "assets/sprites/v4/light.png", "assets/sprites/v4/light%402x.json", "assets/sprites/v4/light%402x.png", "data/manifest.json", "data/peaks.geojson", "data/places.json", "data/zones.geojson", "data/zones.json", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-32.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon.svg", "index.html", "manifest.webmanifest", "styles/dark.json", "styles/light.json", "styles/sun.json", "vendor/LICENSE-maplibre.txt", "vendor/maplibre-gl-shared.js", "vendor/maplibre-gl-worker.js", "vendor/maplibre-gl.css", "vendor/maplibre-gl.js"];
const INFO = {"version": "0.1.0+4fa5527e", "build": "e91d4d9dd681", "placeIds": ["abbazia-s-clemente-a-casauria", "torre-de-passeri", "tocco-da-casauria", "bolognano-piccioni-e-scura", "popoli", "musellaro-s-tommaso-bolognano", "s-valentino-in-abruzzo-citeriore", "salle", "caramanico-terme", "eremo-di-s-bartolomeo-in-legio", "eremo-di-s-spirito-a-majella", "abbateggio", "roccamorice", "sulmona", "pacentro", "badia-morronese-s-onofrio-s-croce-al-morrone", "pettorano-sul-gizio", "cansano", "pescocostanzo", "rivisondoli", "roccaraso", "l-aquila", "campo-imperatore", "corno-grande", "assergi", "s-stefano-di-sessanio", "rocca-calascio", "lago-sinizzo", "grotte-di-stiffe", "bominaco-s-michele-or-s-pellegrino", "navelli", "capestrano", "canoe-tirino-bussi-sul-tirino", "celano", "gole-di-celano", "prati-di-tivo", "corno-piccolo", "castelli", "campli", "civitella-del-tronto", "ascoli-piceno", "cocullo", "anversa-degli-abruzzi", "villalago", "lago-di-s-domenico", "scanno", "lago-di-scanno", "guardiagrele", "pennapiedimonte-balzolo", "semivicoli", "fara-san-martino", "grotta-del-cavallone-taranta-peligna", "lama-dei-peligni", "roccascalegna", "lago-di-bomba", "monte-amaro", "blockhaus", "passolanciano-maielletta", "serramonacesca", "abbazia-s-liberatore-a-majella", "roccamontepiano", "manoppello-volto-santo", "pretoro", "chieti", "pineto-torre-di-cerrano", "atri-calanchi", "citta-sant-angelo", "pescara", "ortona", "ripari-di-giobbe-ortona", "punta-cavalluccio-costa-dei-trabocchi", "trabocco-pesce-palombo", "s-giovanni-in-venere-fossacesia", "beach-punta-aderci-punta-della-penna", "vasto-s-maria-incoronata", "statua-della-sirenetta-vasto-marina", "roma", "tivoli-villa-d-este"], "dataVersion": "d1c084ea2196", "dataBytes": 96716063};
const APP_CACHE = `app-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    // cache: "reload" bypasses the HTTP cache so a new version never mixes old files.
    await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })));
    // First install activates at once; later versions wait until the user taps "Update".
    if (!self.registration.active) await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("app-") && key !== APP_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "INFO") event.ports[0]?.postMessage(INFO);
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // never touch other origins
  if (url.pathname.includes("/data/parts/")) return;     // map parts: page downloads and caches them
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    if (req.mode === "navigate") {
      return (await cache.match("./")) || (await cache.match("index.html")) || fetch(req);
    }
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    return fetch(req);
  })());
});
