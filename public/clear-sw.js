// Clear service worker and cache for development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('🧹 Clearing service worker and cache for development...');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✅ All caches cleared');
    });
  }
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        console.log('🚫 Unregistering service worker:', registration.scope);
        registration.unregister();
      }
    });
  }
  
  console.log('🔄 Please refresh the page to see clean console');
}
