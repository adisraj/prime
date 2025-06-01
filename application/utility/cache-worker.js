importScripts("https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js");

// Configure localForage for storing domain-specific metadata
self.localforage.config({
  name: "CacheWorkerDB",
  storeName: "cache_metadata",
});

/* store the cache in localforage */
self.onmessage = async function (event) {
  const { action, domain, data } = event.data;

  if (action === "storeCache") {
    try {
      const metadata = (await self.localforage.getItem("domain-cache-metadata")) || {};
      metadata[domain] = data; 
      // Open Cache Storage and add resources to cache
      const cache = await caches.open(domain);
      await Promise.all(
        data.map(async (path) => {
          try {
            const response = await fetch(path);
            if (response.ok) {
              await cache.put(path, response.clone()); // Cache the resource
            } else {
              console.warn(`Failed to fetch resource: ${path}`);
            }
          } catch (error) {
            console.error(`Error caching resource: ${path}`, error);
          }
        })
      );
      // Save metadata in localforage
      await self.localforage.setItem("domain-cache-metadata", metadata);
      self.postMessage({ success: true, message: "Cache metadata and resources stored successfully." });
    } catch (error) {
      self.postMessage({ success: false, message: "Error storing cache metadata.", error: error.message });
    }
  }

  if (action === "clearCache") {
    try {
      // Configure localforage to target the specific CacheWorkerDB
      self.localforage.config({
        name: "CacheWorkerDB",
        storeName: "cache_metadata"
      });
      // Step 1: Clear the specific IndexedDB database
      await self.localforage.clear();
      // Step 2: Clear Cache Storage
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          try {
            await caches.delete(cacheName);
          } catch (error) {
            console.error(`Error deleting cache ${cacheName}:`, error);
          }
        })
      );
      // Step 3: Delete the entire CacheWorkerDB database
      await new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase("CacheWorkerDB");
        deleteRequest.onerror = () => {
          reject(new Error("Error deleting CacheWorkerDB database"));
        };
        deleteRequest.onsuccess = () => {
          resolve();
        };
      });
      // Step 4: Force service worker unregistration
      if (self.registration) {
        await self.registration.unregister();
      }
      self.postMessage({
        success: true,
        message: "Cache and IndexedDB cleared successfully"
      });
    } catch (error) {
      console.error("Error in cache clearing:", error);
      self.postMessage({
        success: false,
        message: `Error clearing cache: ${error.message}`
      });
    }
  }
}

