const CACHE_NAME = 'focototal-fitness-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // O Service Worker irá armazenar outros recursos em cache conforme forem solicitados.
];

self.addEventListener('install', event => {
  // Executa os passos de instalação
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Não armazena em cache as solicitações de API para o Supabase ou Google
  if (request.url.includes('supabase.co') || request.url.includes('googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Para outras solicitações, usa uma estratégia "cache-first" (primeiro o cache)
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Encontrado no cache - retorna a resposta do cache
        if (response) {
          return response;
        }

        return fetch(request).then(
          response => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANTE: Clona a resposta. Uma resposta é um stream
            // e como queremos que tanto o navegador quanto o cache consumam a resposta,
            // precisamos cloná-la para ter dois streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
