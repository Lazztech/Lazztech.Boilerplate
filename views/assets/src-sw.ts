import { precacheAndRoute } from 'workbox-precaching';
import { warmStrategyCache } from 'workbox-recipes';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Optional: use the injectManifest mode of one of the Workbox
// build tools to precache a list of URLs, including fallbacks.
precacheAndRoute(self.__WB_MANIFEST);

const STRATEGY = new NetworkFirst();

warmStrategyCache({
  urls: ['/modules/htmx.min.js', '/modules/sse.js'],
  strategy: STRATEGY,
});

// https://developer.chrome.com/docs/workbox/modules/workbox-routing
registerRoute(({ url, sameOrigin }) => {
  console.log(
    `registerRoute - URL: ${url.pathname}, sameOrigin: ${sameOrigin}`,
  );
  return sameOrigin;
}, STRATEGY);

// https://developer.chrome.com/docs/workbox/managing-fallback-responses#comprehensive_fallbacks
const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_STRATEGY = new StaleWhileRevalidate();

// Warm the runtime cache with a list of asset URLs
warmStrategyCache({
  urls: [FALLBACK_HTML_URL],
  strategy: FALLBACK_STRATEGY,
});

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(async ({ event }) => {
  // The warmStrategyCache recipe is used to add the fallback assets ahead of
  // time to the runtime cache, and are served in the event of an error below.
  // Use `event`, `request`, and `url` to figure out how to respond, or
  // use request.destination to match requests for specific resource types.
  console.log(`setCatchHandler callback:`, event);

  return FALLBACK_STRATEGY.handle({ event, request: FALLBACK_HTML_URL }).catch(
    // If we don't have a fallback, return an error response.
    () => Response.error(),
  );
});
