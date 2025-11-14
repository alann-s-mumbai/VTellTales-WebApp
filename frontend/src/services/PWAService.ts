type SyncManagerLike = {
  register(tag: string): Promise<void>;
  getTags?(): Promise<string[]>;
};

type SyncCapableServiceWorkerRegistration = ServiceWorkerRegistration & {
  sync: SyncManagerLike;
};

// PWA Service Worker Registration and Management
export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.swRegistration);

        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });

        // Listen for online/offline events
        this.setupNetworkListeners();

        // Don't request notification permission on init - wait for user gesture
        // await this.requestNotificationPermission();

        // Setup background sync
        this.setupBackgroundSync();

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private isSyncCapableRegistration(
    registration: ServiceWorkerRegistration
  ): registration is SyncCapableServiceWorkerRegistration {
    const candidate = registration as { sync?: SyncManagerLike };
    return typeof candidate.sync?.register === 'function';
  }

  private handleServiceWorkerUpdate(): void {
    const newWorker = this.swRegistration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Show update available notification
          this.showUpdateNotification();
        }
      });
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is back online');
      // Trigger background sync when back online
      this.triggerBackgroundSync();
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
      this.showOfflineNotification();
    });
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Only request if not already granted or denied
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      }
    }
  }

  // Public method to request notification permission on user action
  async enableNotifications(): Promise<boolean> {
    await this.requestNotificationPermission();
    return Notification.permission === 'granted';
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Background sync is available
      console.log('Background sync is available');
    }
  }

  async triggerBackgroundSync(): Promise<void> {
    const registration = this.swRegistration;
    if (registration && this.isSyncCapableRegistration(registration)) {
      try {
        await registration.sync.register('background-sync-stories');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('Cache cleared');
    }
  }

  async getCacheSize(): Promise<number> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    }
    return 0;
  }

  // Install prompt management
  private deferredPrompt: any = null;

  setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      this.deferredPrompt = e;
      // Show custom install button
      this.showInstallButton();
    });
  }

  async showInstallPrompt(): Promise<boolean> {
    if (this.deferredPrompt) {
      // Show the prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      // Clear the stored prompt
      this.deferredPrompt = null;
      // Hide the install button
      this.hideInstallButton();
      
      return outcome === 'accepted';
    }
    return false;
  }

  private showInstallButton(): void {
    // Dispatch custom event to show install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton(): void {
    // Dispatch custom event to hide install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  // Notification helpers
  private showUpdateNotification(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private showOnlineNotification(): void {
    window.dispatchEvent(new CustomEvent('network-online'));
  }

  private showOfflineNotification(): void {
    window.dispatchEvent(new CustomEvent('network-offline'));
  }

  // Getters
  get isAppOnline(): boolean {
    return this.isOnline;
  }

  get serviceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }

  // Check if app is running as PWA
  get isRunningAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Share API integration
  async shareStory(story: { title: string; text: string; url: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.text,
          url: story.url
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  }
}
