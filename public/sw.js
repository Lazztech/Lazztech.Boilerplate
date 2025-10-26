self.addEventListener('install', function (event) {
  event.waitUntil(preLoad());
});

var preLoad = function () {
  // Add any other routes or assets you want to cache
  const urlsToCache = [
    '/',
    '/offline.html',
    '/modules/htmx.min.js',
    '/modules/sse.js',
    '/main.css',
    '/favicon.ico',
  ];

  console.log('Installing web app');
  return caches.open('offline').then(function (cache) {
    console.log('caching index and important routes');
    return cache.addAll(urlsToCache);
  });
};

self.addEventListener('fetch', function (event) {
  event.respondWith(
    checkResponse(event.request).catch(function () {
      return returnFromCache(event.request);
    }),
  );
  event.waitUntil(addToCache(event.request.clone()));
});

var checkResponse = function (request) {
  return new Promise(function (fulfill, reject) {
    fetch(request.clone()).then(function (response) {
      // ← Clone here too
      if (response.status !== 404) {
        fulfill(response);
      } else {
        reject();
      }
    }, reject);
  });
};

var addToCache = function (request) {
  return caches.open('offline').then(function (cache) {
    return fetch(request).then(function (response) {
      console.log(response.url + ' was cached');
      return cache.put(request, response.clone());
    });
  });
};

var returnFromCache = function (request) {
  return caches.open('offline').then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status == 404) {
        return cache.match('offline.html');
      } else {
        return matching;
      }
    });
  });
};
