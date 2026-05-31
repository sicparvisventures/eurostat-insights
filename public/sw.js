/* Eurostat Insights — service worker
   Strategy:
   - Precache the app shell + offline fallback on install.
   - App navigations: network-first, fall back to cache, then /offline.
   - Eurostat API proxy (/api/eurostat): stale-while-revalidate so data is
     instantly available offline after first view.
   - Static assets: cache-first.
*/
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const DATA_CACHE = `data-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;

const SHELL_ASSETS = ["/", "/offline", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                ![SHELL_CACHE, DATA_CACHE, ASSET_CACHE].includes(k),
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/eurostat");
}

function isAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|svg|jpg|jpeg|webp|woff2?|json|geojson|topojson)$/.test(
      url.pathname,
    )
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Eurostat data: stale-while-revalidate
  if (isApi(url)) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Static assets: cache-first
  if (isAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Navigations: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/offline")) ||
            (await cache.match("/")) ||
            new Response("Offline", { status: 503 })
          );
        }),
    );
  }
});
