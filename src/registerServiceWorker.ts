export function registerServiceWorker() {
  // Only register service worker in production (GitHub Pages)
  const isProduction = window.location.hostname.endsWith('.github.io');

  if (!isProduction) {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${window.location.origin}/MarbleRoulette/service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .catch(() => {
          // Silent fail - service worker is optional
        });
    });
  }
}
