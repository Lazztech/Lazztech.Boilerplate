importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js',
);

const { precacheAndRoute, matchPrecache } = workbox.precaching;
const { setDefaultHandler, setCatchHandler } = workbox.routing;
const { StaleWhileRevalidate } = workbox.strategies;
const { warmStrategyCache } = workbox.recipes;

// https://developer.chrome.com/docs/workbox/managing-fallback-responses#comprehensive_fallbacks

// Optional: use the injectManifest mode of one of the Workbox
// build tools to precache a list of URLs, including fallbacks.
precacheAndRoute([{"revision":"e4cb185b2e80d1080505613a40f431fc","url":"assets/lazztech_icon.png"},{"revision":"f0598a10b39d3b5a995d9ef85ede09c4","url":"assets/lazztech_icon.webp"},{"revision":"79e868ce803271f9a7de3276ecfeb4c4","url":"bundle.css"},{"revision":"94b6c004ad842941f17b240925753230","url":"favicon.ico"},{"revision":"f0598a10b39d3b5a995d9ef85ede09c4","url":"icons/icon_1000x1000.webp"},{"revision":"ba833a413cf3014b8b30e51a3b973e51","url":"manifest.json"},{"revision":"ca121b5d03245bf82db00d14cee04e22","url":"robots.txt"}]);

const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_STRATEGY = new StaleWhileRevalidate();

// Warm the runtime cache with a list of asset URLs
warmStrategyCache({
  urls: ['/', FALLBACK_HTML_URL, '/modules/htmx.min.js', '/modules/sse.js'],
  strategy: FALLBACK_STRATEGY,
});

// Use a stale-while-revalidate strategy to handle requests by default.
setDefaultHandler(new StaleWhileRevalidate());

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(async ({ request }) => {
  // Fallback assets are precached when the service worker is installed, and are
  // served in the event of an error below. Use `event`, `request`, and `url` to
  // figure out how to respond, or use request.destination to match requests for
  // specific resource types.
  switch (request.destination) {
    case 'document':
      // FALLBACK_HTML_URL must be defined as a precached URL for this to work:
      return matchPrecache(FALLBACK_HTML_URL);

    default:
      // If we don't have a fallback, return an error response.
      return Response.error();
  }
});
