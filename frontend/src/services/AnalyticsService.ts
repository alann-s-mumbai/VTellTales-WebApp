// Analytics Service for VTellTales WebApp
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface UserProperties {
  user_id?: string;
  age_group?: string;
  preferred_genre?: string;
  stories_created?: number;
  stories_read?: number;
  user_type?: 'creator' | 'reader' | 'both';
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private isDebugMode = import.meta.env.DEV;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Google Analytics 4 if available
      if (typeof gtag !== 'undefined') {
        this.initializeGA4();
      }

      // Initialize custom analytics
      this.initializeCustomAnalytics();

      this.isInitialized = true;
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private initializeGA4(): void {
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (GA_MEASUREMENT_ID) {
      // Configure GA4
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: 'VTellTales WebApp',
        page_location: window.location.href,
        custom_map: {
          dimension1: 'story_genre',
          dimension2: 'user_type',
          dimension3: 'session_id'
        }
      });

      console.log('Google Analytics 4 initialized');
    }
  }

  private initializeCustomAnalytics(): void {
    // Set up custom analytics storage
    this.setupLocalStorage();
    
    // Track page views automatically
    this.trackPageView();
    
    // Set up performance monitoring
    this.setupPerformanceTracking();
    
    // Track user engagement
    this.setupEngagementTracking();
  }

  private setupLocalStorage(): void {
    const stored = localStorage.getItem('vtelltales_analytics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.events = data.events || [];
      } catch (error) {
        console.error('Failed to parse stored analytics data:', error);
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core tracking methods
  setUserId(userId: string): void {
    this.userId = userId;
    
    if (typeof gtag !== 'undefined') {
      gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
    
    this.trackEvent({
      event: 'user_identification',
      category: 'user',
      action: 'set_user_id',
      custom_parameters: {
        user_id: userId,
        session_id: this.sessionId
      }
    });
  }

  setUserProperties(properties: UserProperties): void {
    if (typeof gtag !== 'undefined') {
      gtag('set', { user_properties: properties });
    }
    
    this.trackEvent({
      event: 'user_properties_update',
      category: 'user',
      action: 'update_properties',
      custom_parameters: properties
    });
  }

  trackEvent(event: AnalyticsEvent): void {
    const enhancedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      url: window.location.href,
      user_agent: navigator.userAgent
    };

    // Store event locally
    this.events.push(enhancedEvent);
    this.saveToLocalStorage();

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(enhancedEvent);

    if (this.isDebugMode) {
      console.log('Analytics Event:', enhancedEvent);
    }
  }

  private async sendToCustomAnalytics(event: any): Promise<void> {
    try {
      // Send to your custom analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      if (this.isDebugMode) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }

  // Page tracking
  trackPageView(pageName?: string): void {
    const page = pageName || this.getCurrentPageName();
    
    this.trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      custom_parameters: {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      }
    });
  }

  private getCurrentPageName(): string {
    const path = window.location.pathname;
    const routes = {
      '/': 'Home',
      '/login': 'Login',
      '/register': 'Register',
      '/profile': 'Profile',
      '/stories': 'Story List',
      '/story/': 'Story Details',
      '/creator': 'Story Creator',
      '/dashboard': 'Dashboard'
    };

    for (const [route, name] of Object.entries(routes)) {
      if (path === route || (route.endsWith('/') && path.startsWith(route))) {
        return name;
      }
    }

    return 'Unknown Page';
  }

  // Story-specific tracking
  trackStoryView(storyId: string, storyTitle: string, genre?: string): void {
    this.trackEvent({
      event: 'story_view',
      category: 'story',
      action: 'view',
      label: storyTitle,
      custom_parameters: {
        story_id: storyId,
        story_title: storyTitle,
        story_genre: genre
      }
    });
  }

  trackStoryCreate(storyData: { title: string; genre: string; pages: number }): void {
    this.trackEvent({
      event: 'story_create',
      category: 'story',
      action: 'create',
      label: storyData.title,
      value: storyData.pages,
      custom_parameters: storyData
    });
  }

  trackStoryComplete(storyId: string, timeSpent: number): void {
    this.trackEvent({
      event: 'story_complete',
      category: 'story',
      action: 'complete',
      value: Math.round(timeSpent / 1000), // Convert to seconds
      custom_parameters: {
        story_id: storyId,
        time_spent_ms: timeSpent
      }
    });
  }

  // User interaction tracking
  trackButtonClick(buttonName: string, location: string): void {
    this.trackEvent({
      event: 'button_click',
      category: 'interaction',
      action: 'click',
      label: buttonName,
      custom_parameters: {
        button_name: buttonName,
        location: location
      }
    });
  }

  trackSearch(query: string, results: number): void {
    this.trackEvent({
      event: 'search',
      category: 'interaction',
      action: 'search',
      label: query,
      value: results,
      custom_parameters: {
        search_query: query,
        results_count: results
      }
    });
  }

  trackFilter(filterType: string, filterValue: string): void {
    this.trackEvent({
      event: 'filter_applied',
      category: 'interaction',
      action: 'filter',
      label: `${filterType}:${filterValue}`,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue
      }
    });
  }

  // Performance tracking
  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.trackEvent({
        event: 'page_performance',
        category: 'performance',
        action: 'page_load',
        value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        custom_parameters: {
          dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          first_paint: this.getFirstPaint(),
          largest_contentful_paint: this.getLargestContentfulPaint()
        }
      });
    });
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : undefined;
  }

  private getLargestContentfulPaint(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.trackEvent({
          event: 'largest_contentful_paint',
          category: 'performance',
          action: 'lcp',
          value: Math.round(lastEntry.startTime)
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // Engagement tracking
  private setupEngagementTracking(): void {
    let startTime = Date.now();
    
    // Track time on page
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - startTime;
      this.trackEvent({
        event: 'page_engagement',
        category: 'engagement',
        action: 'time_on_page',
        value: Math.round(timeSpent / 1000),
        custom_parameters: {
          time_spent_ms: timeSpent
        }
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track scroll milestones
        if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
          this.trackEvent({
            event: 'scroll_depth',
            category: 'engagement',
            action: 'scroll_25',
            value: 25
          });
        } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
          this.trackEvent({
            event: 'scroll_depth',
            category: 'engagement',
            action: 'scroll_50',
            value: 50
          });
        } else if (maxScrollDepth >= 75 && maxScrollDepth < 90) {
          this.trackEvent({
            event: 'scroll_depth',
            category: 'engagement',
            action: 'scroll_75',
            value: 75
          });
        } else if (maxScrollDepth >= 90) {
          this.trackEvent({
            event: 'scroll_depth',
            category: 'engagement',
            action: 'scroll_90',
            value: 90
          });
        }
      }
    }, { passive: true });
  }

  // Data management
  private saveToLocalStorage(): void {
    try {
      const data = {
        events: this.events.slice(-100), // Keep only last 100 events
        sessionId: this.sessionId,
        userId: this.userId
      };
      localStorage.setItem('vtelltales_analytics', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  // Get analytics data for admin dashboard
  getAnalyticsData(): any {
    return {
      events: this.events,
      sessionId: this.sessionId,
      userId: this.userId,
      isInitialized: this.isInitialized
    };
  }

  // Clear analytics data
  clearData(): void {
    this.events = [];
    localStorage.removeItem('vtelltales_analytics');
  }
}

// Global analytics instance
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    analytics: AnalyticsService;
  }
}

// Make analytics available globally
window.analytics = AnalyticsService.getInstance();