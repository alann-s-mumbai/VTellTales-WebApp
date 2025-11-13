// Performance optimization service for VTellTales WebApp
interface CacheConfig {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of items
  strategy: 'lru' | 'lfu' | 'fifo';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    
    // Remove expired items
    this.cleanup();
    
    // Remove oldest item if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access info
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  getSize(): number {
    return this.cache.size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        accessCount: item.accessCount,
        age: Date.now() - item.timestamp,
        lastAccessed: Date.now() - item.lastAccessed
      }))
    };
  }
}

export class PerformanceService {
  private static instance: PerformanceService;
  
  // Different caches for different types of data
  private storyCache = new LRUCache<any>({
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
    strategy: 'lru'
  });
  
  private imageCache = new LRUCache<string>({
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    strategy: 'lru'
  });
  
  private apiCache = new LRUCache<any>({
    maxAge: 2 * 60 * 1000, // 2 minutes
    maxSize: 200,
    strategy: 'lru'
  });

  // Performance metrics
  private metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
    imageLoads: 0,
    bundleSize: 0,
    loadTimes: [] as number[]
  };

  // Lazy loading observer
  private imageObserver: IntersectionObserver | null = null;
  private componentObserver: IntersectionObserver | null = null;

  // Request deduplication
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  init(): void {
    this.setupImageLazyLoading();
    this.setupComponentLazyLoading();
    this.measureBundleSize();
    this.startPerformanceMonitoring();
    
    console.log('Performance service initialized');
  }

  // API Response Caching with deduplication
  async cachedFetch<T>(url: string, options?: RequestInit, cacheKey?: string): Promise<T> {
    const key = cacheKey || `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.apiCache.get(key);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }
    
    // Make new request
    this.metrics.cacheMisses++;
    this.metrics.apiCalls++;
    
    const requestPromise = fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful responses
      this.apiCache.set(key, data);
      
      // Remove from pending requests
      this.pendingRequests.delete(key);
      
      return data;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(key);
      throw error;
    });
    
    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  // Story-specific caching
  async getStory(storyId: string): Promise<any> {
    const cacheKey = `story_${storyId}`;
    
    const cached = this.storyCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const story = await this.cachedFetch(`/storyapi/StoryBook/GetStoryById/${storyId}`);
    this.storyCache.set(cacheKey, story);
    
    return story;
  }

  async getStories(): Promise<any[]> {
    return this.cachedFetch('/storyapi/StoryBook/GetAdminAllStories', undefined, 'all_stories');
  }

  // Image optimization and lazy loading
  setupImageLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.imageObserver?.unobserve(img);
            }
          });
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }
  }

  observeImage(img: HTMLImageElement): void {
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    }
  }

  private async loadImage(img: HTMLImageElement): Promise<void> {
    const src = img.dataset.src;
    if (!src) return;
    
    this.metrics.imageLoads++;
    
    // Check image cache
    const cached = this.imageCache.get(src);
    if (cached) {
      img.src = cached;
      img.classList.add('loaded');
      return;
    }
    
    try {
      // Preload image
      const imageBlob = await fetch(src).then(r => r.blob());
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Cache the blob URL
      this.imageCache.set(src, imageUrl);
      
      img.src = imageUrl;
      img.classList.add('loaded');
    } catch (error) {
      console.error('Failed to load image:', src, error);
      img.src = src; // Fallback to direct URL
    }
  }

  // Component lazy loading
  setupComponentLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.componentObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const componentName = element.dataset.lazyComponent;
              
              if (componentName) {
                this.loadComponent(componentName, element);
                this.componentObserver?.unobserve(element);
              }
            }
          });
        },
        {
          root: null,
          rootMargin: '100px',
          threshold: 0.1
        }
      );
    }
  }

  observeComponent(element: HTMLElement): void {
    if (this.componentObserver) {
      this.componentObserver.observe(element);
    }
  }

  private async loadComponent(componentName: string, element: HTMLElement): Promise<void> {
    try {
      // Dynamic import based on component name
      const componentModule = await import(`../components/${componentName}.tsx`);
      const Component = componentModule.default;
      
      // This would need to integrate with React rendering
      console.log(`Lazy loaded component: ${componentName}`);
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
    }
  }

  // Bundle size analysis
  measureBundleSize(): void {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Estimate bundle size based on network timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.bundleSize = navigation.transferSize || 0;
      }
    }
  }

  // Performance monitoring
  startPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('Long task detected:', entry.duration, 'ms');
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // longtask not supported
      }

      // Monitor layout shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            console.log('Layout shift detected:', (entry as any).value);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // layout-shift not supported
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
          this.performGarbageCollection();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Memory management
  performGarbageCollection(): void {
    // Clear old cache entries
    this.apiCache.clear();
    this.imageCache.clear();
    
    // Clear completed requests
    this.pendingRequests.clear();
    
    console.log('Performed garbage collection');
  }

  // Preloading strategies
  async preloadCriticalResources(): Promise<void> {
    const criticalStories = ['featured', 'recent', 'popular'];
    
    try {
      const preloadPromises = criticalStories.map(async (type) => {
        return this.cachedFetch(`/storyapi/StoryBook/Get${type}Stories`);
      });
      
      await Promise.all(preloadPromises);
      console.log('Critical resources preloaded');
    } catch (error) {
      console.error('Failed to preload critical resources:', error);
    }
  }

  preloadNextPage(currentPath: string): void {
    const routes: Record<string, string[]> = {
      '/': ['/stories', '/login'],
      '/stories': ['/story/'],
      '/profile': ['/creator'],
      '/login': ['/register', '/']
    };
    
    const nextRoutes = routes[currentPath];
    if (nextRoutes) {
      nextRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }

  // Resource compression
  async compressData(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const compressed = await reader.read();
      return btoa(String.fromCharCode(...new Uint8Array(compressed.value)));
    }
    
    // Fallback: simple compression
    return btoa(jsonString);
  }

  async decompressData(compressedData: string): Promise<any> {
    if ('DecompressionStream' in window) {
      try {
        const binaryData = atob(compressedData);
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(new Uint8Array([...binaryData].map(c => c.charCodeAt(0))));
        writer.close();
        
        const decompressed = await reader.read();
        const jsonString = new TextDecoder().decode(decompressed.value);
        
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Decompression failed:', error);
      }
    }
    
    // Fallback: simple decompression
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  }

  // Performance metrics
  getMetrics() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses);
    
    return {
      ...this.metrics,
      cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
      averageLoadTime: this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length || 0,
      cacheStats: {
        story: this.storyCache.getStats(),
        image: this.imageCache.getStats(),
        api: this.apiCache.getStats()
      }
    };
  }

  recordLoadTime(time: number): void {
    this.metrics.loadTimes.push(time);
    
    // Keep only last 100 measurements
    if (this.metrics.loadTimes.length > 100) {
      this.metrics.loadTimes = this.metrics.loadTimes.slice(-100);
    }
  }

  // Clear all caches
  clearAllCaches(): void {
    this.storyCache.clear();
    this.imageCache.clear();
    this.apiCache.clear();
    this.pendingRequests.clear();
    
    // Clear browser caches if supported
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    console.log('All caches cleared');
  }

  // Service worker cache management
  async updateServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }

  destroy(): void {
    this.imageObserver?.disconnect();
    this.componentObserver?.disconnect();
    this.clearAllCaches();
  }
}