// AviYatra service worker v3
// Strategy: NETWORK-FIRST for the app itself (index.html) so updates appear
// immediately, with the cached copy as the offline fallback. Icons/manifest
// stay cache-first. Bumping CACHE forces a full refresh on all phones.
const CACHE = "aviyatra-v3";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(ASSETS.map((a) =>
        fetch(new Request(a, { cache: "reload" }))
          .then((res) => { if (res.ok) return c.put(a, res); })
          .catch(() => { /* offline during install — fill later */ })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function idbPut(key, value) {
  return new Promise((res, rej) => {
    const r = indexedDB.open("journeylog", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      const t = r.result.transaction("kv", "readwrite");
      const q = t.objectStore("kv").put(value, key);
      q.onsuccess = () => res();
      q.onerror = () => rej(q.error);
    };
  });
}

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(req).then((res) => { clearTimeout(timer); resolve(res); },
                    (err) => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // WhatsApp share-target: receive the file, stash it, open the app
  if (e.request.method === "POST" && url.pathname.endsWith("/share-target")) {
    e.respondWith((async () => {
      try {
        const form = await e.request.formData();
        const file = form.get("media");
        if (file && file.size) await idbPut("__shared", file);
      } catch (err) { /* no file shared */ }
      return Response.redirect(new URL("./index.html?shared=1", self.registration.scope).href, 303);
    })());
    return;
  }

  if (e.request.method !== "GET") return;

  const isAppShell =
    e.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/journeylog/") ||
    url.pathname === "/";

  if (isAppShell) {
    // Network-first (3s budget): newest version when online, cached copy offline
    e.respondWith(
      fetchWithTimeout(new Request("./index.html", { cache: "no-cache" }), 3000)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            e.waitUntil(caches.open(CACHE).then((c) => c.put("./index.html", clone)));
          }
          return res;
        })
        .catch(() => caches.match("./index.html", { ignoreSearch: true }))
    );
    return;
  }

  // Everything else (icons, manifest): cache-first with background fill
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit || fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, clone)));
        }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
