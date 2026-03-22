/**
 * Simple in-memory cache service
 * For production, use Redis or similar
 */

class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
    }

    /**
     * Set a value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
     */
    set(key, value, ttl = 300) {
        this.cache.set(key, value);

        // Set expiry
        if (ttl > 0) {
            const expiryTime = Date.now() + (ttl * 1000);
            this.ttls.set(key, expiryTime);

            // Auto-delete after TTL
            setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
        }

        return true;
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {*} - Cached value or null
     */
    get(key) {
        // Check if expired
        if (this.ttls.has(key)) {
            const expiryTime = this.ttls.get(key);
            if (Date.now() > expiryTime) {
                this.delete(key);
                return null;
            }
        }

        return this.cache.get(key) || null;
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.ttls.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern to match (simple string contains)
     */
    deletePattern(pattern) {
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        return keysToDelete.length;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttls.clear();
    }

    /**
     * Get cache statistics
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Wrap a function with caching
     * @param {string} key - Cache key
     * @param {Function} fn - Async function to execute if cache miss
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<*>} - Cached or fresh data
     */
    async wrap(key, fn, ttl = 300) {
        // Try to get from cache
        const cached = this.get(key);
        if (cached !== null) {
            console.log(`✅ Cache HIT: ${key}`);
            return cached;
        }

        // Cache miss - execute function
        console.log(`❌ Cache MISS: ${key}`);
        const result = await fn();

        // Store in cache
        this.set(key, result, ttl);

        return result;
    }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;

// Helper functions for common cache patterns
export const cacheKeys = {
    categories: () => 'categories:all',
    category: (id) => `category:${id}`,
    workers: (filters) => `workers:${JSON.stringify(filters)}`,
    worker: (id) => `worker:${id}`,
    subcategories: (categoryId) => `subcategories:${categoryId}`
};

export const cacheTTL = {
    short: 60,      // 1 minute
    medium: 300,    // 5 minutes
    long: 1800,     // 30 minutes
    veryLong: 3600  // 1 hour
};
