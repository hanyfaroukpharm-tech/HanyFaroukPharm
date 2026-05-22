// ============================================================
//  sw.js — Service Worker (تنصيب التطبيق على الموبايل)
// ============================================================

const CACHE_NAME = "hany-pharmacy-v1";

// الملفات اللي هتتحفظ للتنصيب
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/config.js",
  "/js/api.js",
  "/js/cart.js",
  "/js/products.js",
  "/js/order.js",
  "/js/ui.js",
  "/js/app.js",
  "/images/logo.avif",
  "/images/logo_icon.avif",
  "/images/cover.avif",
];

// ── التنصيب: حفظ الملفات في الـ Cache ──
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── التفعيل: حذف الـ Cache القديم ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── الطلبات: Network أولاً، لو فشل → Cache ──
self.addEventListener("fetch", event => {
  // مش نتدخل في طلبات الـ API (Google Sheets)
  if (event.request.url.includes("script.google.com")) return;
  if (event.request.url.includes("fonts.googleapis.com")) return;
  if (event.request.url.includes("cdn.")) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // لو جه من النت، حدّث الـ Cache
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => {
        // لو مفيش نت، رجّع من الـ Cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // لو مش موجود في الـ Cache، رجّع الـ index.html
          return caches.match("/index.html");
        });
      })
  );
});
