import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { warmStrategyCache } from 'workbox-recipes';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// https://developer.chrome.com/docs/workbox/modules/workbox-core#clients_claim
// This clientsClaim() should be at the top level
// of your service worker, not inside of, e.g.,
// an event handler.
clientsClaim();

declare const self: ServiceWorkerGlobalScope;

// Optional: use the injectManifest mode of one of the Workbox
// build tools to precache a list of URLs, including fallbacks.
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_STRATEGY = new NetworkFirst();
const FALLBACK_HTML_URL = '/offline.html';

// Warm the runtime cache with a list of asset URLs
warmStrategyCache({
  urls: ['/', FALLBACK_HTML_URL, '/modules/htmx.min.js', '/modules/sse.js'],
  strategy: CACHE_STRATEGY,
});

// https://developer.chrome.com/docs/workbox/modules/workbox-routing
registerRoute(({ url, request, sameOrigin }) => {
  const isHtmxRequest = request.headers.get('HX-Request') === 'true';
  // Match same-origin requests OR HTMX requests
  const shouldRegisterRoute = sameOrigin || isHtmxRequest;
  console.log(
    `SW intercepted request, is (sameOrigin || isHtmxRequest): ${shouldRegisterRoute}, URL: ${url.pathname}, sameOrigin: ${sameOrigin}, HTMX: ${isHtmxRequest}`,
  );

  return shouldRegisterRoute;
}, CACHE_STRATEGY);

// https://developer.chrome.com/docs/workbox/managing-fallback-responses
// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(async ({ event }) => {
  // The warmStrategyCache recipe is used to add the fallback assets ahead of
  // time to the runtime cache, and are served in the event of an error below.
  // Use `event`, `request`, and `url` to figure out how to respond, or
  // use request.destination to match requests for specific resource types.
  console.log(`setCatchHandler callback:`, event);

  return CACHE_STRATEGY.handle({ event, request: FALLBACK_HTML_URL }).catch(
    // If we don't have a fallback, return an error response.
    () => Response.error(),
  );
});
