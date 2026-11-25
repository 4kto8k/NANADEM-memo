/* 나나덤: 인터넷이 약하거나 끊겨도 화면이 열리게 저장해 두는 파일 (서비스 워커)
   - 화면(index.html): 인터넷이 되면 항상 새로 받아오고, 안 되면 저장해 둔 것을 씀 → 업데이트가 바로 반영됨
   - 아이콘·글꼴·NoSleep: 저장해 둔 것을 먼저 쓰고 뒤에서 새로 받아 둠
   - 랭킹·여러 테이블(Supabase)은 저장하지 않음: 항상 서버에서 */
const CACHE = "nanadum-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./vendor/NoSleep.min.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/maskable-512.png",
  "./sounds/gong.mp3", "./sounds/gong-cymbal.mp3"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("nanadum-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co")) return;                 // 서버 데이터는 그대로 통과

  const isPage = req.mode === "navigate" || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname));
  if (isPage) {
    // 화면: 인터넷 먼저, 실패하면 저장본
    // GitHub Pages가 10분 동안 옛 화면을 주지 않게 매번 서버에 새 버전 확인
    e.respondWith(fetch(new Request(url.origin + url.pathname + url.search, { cache: "no-cache", credentials: "same-origin" })).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); }
      return res;
    }).catch(() => caches.match("./index.html").then((r) => r || caches.match("./"))));
    return;
  }

  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin === location.origin || isFont) {
    // 아이콘·글꼴 등: 저장본 먼저, 뒤에서 새로 받아 저장
    e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: url.origin === location.origin }).then((hit) => {
      const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
