// Service Worker minimalista — cacheia arquivos pra funcionar offline
// Versão: incrementa quando atualizar o dashboard
const CACHE = 'triatlo-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Ao instalar, baixa e cacheia os assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Ao ativar, limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Ao buscar recursos, tenta rede primeiro, senão usa cache (network-first)
// Isso garante que atualizações do dashboard chegam quando você tem internet,
// mas continua funcionando offline se rede cair
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // atualiza cache com a versão mais nova
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
