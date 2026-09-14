import { Product } from '../types';

const DB_NAME = 'waga_shop_db';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_META = 'meta';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// In-memory runtime cache for lightning-fast zero-latency access
let memoryProductsCache: Product[] | null = null;
let memoryLastFetchTime: number = 0;

/**
 * Open or upgrade native IndexedDB
 */
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
          db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Create a lightweight version of a product for localStorage fallback
 */
function createCompactProduct(p: Product): Product {
  return {
    ...p,
    // Keep only the primary image thumbnail so it never exhausts localStorage 5MB quota
    imageUrls: p.imageUrls && p.imageUrls.length > 0 ? [p.imageUrls[0]] : [],
  };
}

/**
 * Synchronously retrieves initial products for React useState.
 * Returns cached products in 0ms without waiting.
 */
export function getInitialProductsSync(): Product[] {
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }

  if (typeof window === 'undefined') return [];

  try {
    const cached = localStorage.getItem('waga_products_cache') || sessionStorage.getItem('waga_products_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductsCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return [];
}

/**
 * Asynchronously retrieves all products from IndexedDB (full data with all gallery images).
 * Falls back to localStorage if IndexedDB is empty or unavailable.
 */
export async function getCachedProducts(): Promise<Product[]> {
  // If we already have memory cache, return it immediately
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }

  // 1. Try IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const products: Product[] = await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_PRODUCTS, 'readonly');
          const store = tx.objectStore(STORE_PRODUCTS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });

      if (products.length > 0) {
        products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        memoryProductsCache = products;
        return products;
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback to localStorage
  const syncProducts = getInitialProductsSync();
  return syncProducts;
}

/**
 * Saves products to IndexedDB (full size) and safely saves a compact version to localStorage.
 */
export async function saveProductsCache(products: Product[]): Promise<void> {
  if (!products || products.length === 0) return;

  // 1. Update in-memory cache
  memoryProductsCache = [...products];
  memoryLastFetchTime = Date.now();

  // 2. Save full products to IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction([STORE_PRODUCTS, STORE_META], 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.clear();
      for (const p of products) {
        store.put(p);
      }

      const metaStore = tx.objectStore(STORE_META);
      metaStore.put({ key: 'last_fetch', timestamp: Date.now(), count: products.length });
    }
  } catch (err) {
    console.warn("Could not write to IndexedDB:", err);
  }

  // 3. Save compact version to localStorage (guarded against QuotaExceededError)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('waga_cache_timestamp', Date.now().toString());
      const compactList = products.slice(0, 30).map(createCompactProduct);
      localStorage.setItem('waga_products_cache', JSON.stringify(compactList));
    } catch {
      // If 30 products exceeds quota, save top 15
      try {
        const tinyList = products.slice(0, 15).map(createCompactProduct);
        localStorage.setItem('waga_products_cache', JSON.stringify(tinyList));
      } catch {
        // Fail silently without breaking the app
      }
    }
  }
}

/**
 * Inserts or updates a single product in the cache (e.g. after a seller creates/edits a product)
 */
export async function upsertProductInCache(product: Product): Promise<void> {
  if (memoryProductsCache) {
    const filtered = memoryProductsCache.filter(p => p.id !== product.id);
    memoryProductsCache = [product, ...filtered];
  } else {
    memoryProductsCache = [product];
  }

  // Update IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      tx.objectStore(STORE_PRODUCTS).put(product);
    }
  } catch {}

  // Update compact localStorage
  try {
    const cached = getInitialProductsSync();
    const filtered = cached.filter(p => p.id !== product.id);
    const updated = [createCompactProduct(product), ...filtered].slice(0, 30);
    localStorage.setItem('waga_products_cache', JSON.stringify(updated));
  } catch {}
}

/**
 * Removes a product from the cache (e.g. after a seller deletes a product)
 */
export async function removeProductFromCache(productId: string): Promise<void> {
  if (memoryProductsCache) {
    memoryProductsCache = memoryProductsCache.filter(p => p.id !== productId);
  }

  // Remove from IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      tx.objectStore(STORE_PRODUCTS).delete(productId);
    }
  } catch {}

  // Remove from localStorage
  try {
    const cached = getInitialProductsSync();
    const updated = cached.filter(p => p.id !== productId);
    localStorage.setItem('waga_products_cache', JSON.stringify(updated));
  } catch {}
}

/**
 * Clears the entire product cache
 */
export async function clearAllProductsCache(): Promise<void> {
  memoryProductsCache = null;
  memoryLastFetchTime = 0;

  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction([STORE_PRODUCTS, STORE_META], 'readwrite');
      tx.objectStore(STORE_PRODUCTS).clear();
      tx.objectStore(STORE_META).clear();
    }
  } catch {}

  try {
    localStorage.removeItem('waga_products_cache');
    localStorage.removeItem('waga_cache_timestamp');
  } catch {}
}

/**
 * Smart policy to decide if we should make a network request to Firestore.
 * Saves Firebase reads and prevents offline timeouts.
 */
export function shouldFetchFromNetwork(isManualRefresh = false): boolean {
  // If device is offline, NEVER attempt network!
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  // If user explicitly pulled-to-refresh or clicked refresh, ALWAYS fetch
  if (isManualRefresh) {
    return true;
  }

  // If cache is empty, we must fetch
  const initial = getInitialProductsSync();
  if (initial.length === 0) {
    return true;
  }

  // Check TTL (15 minutes)
  const lastTimeStr = typeof window !== 'undefined' ? localStorage.getItem('waga_cache_timestamp') : null;
  if (lastTimeStr) {
    const lastTime = parseInt(lastTimeStr, 10);
    if (!isNaN(lastTime) && Date.now() - lastTime < CACHE_TTL_MS) {
      // Cache is fresh! Save Firebase reads.
      return false;
    }
  }

  return true;
}

/**
 * Safe Recently Viewed Handler
 * NEVER deletes waga_products_cache!
 */
export function addRecentlyViewed(product: Product): void {
  if (typeof window === 'undefined') return;

  try {
    const stripped: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      city: product.city || '',
      location: product.location || '',
      imageUrls: product.imageUrls && product.imageUrls.length > 0 ? [product.imageUrls[0]] : [],
      isAvailable: product.isAvailable,
      sellerId: product.sellerId,
      startingPrice: product.startingPrice || 0,
      createdAt: product.createdAt || Date.now(),
      description: '',
      isFeatured: false,
    };

    const current = getRecentlyViewed();
    const filtered = current.filter(p => p.id !== product.id);
    const updated = [stripped, ...filtered].slice(0, 10);
    localStorage.setItem('waga_recently_viewed', JSON.stringify(updated));
  } catch {
    // If storage is full, shrink recently viewed to 3 items, DO NOT REMOVE products cache!
    try {
      const current = getRecentlyViewed().slice(0, 3);
      localStorage.setItem('waga_recently_viewed', JSON.stringify(current));
    } catch {}
  }
}

export function getRecentlyViewed(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const recent = localStorage.getItem('waga_recently_viewed');
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
}
