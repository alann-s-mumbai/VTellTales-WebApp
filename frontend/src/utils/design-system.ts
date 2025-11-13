/**
 * VtellTales: WebApp Design System Utilities
 * 
 * Utility functions and helpers for working with the VtellTales: WebApp Design System
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Handles conflicts and duplicates properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Age group configuration
 */
export const AGE_GROUPS = {
  '3-5': {
    label: 'Ages 3-5',
    description: 'Early Learners',
    badgeClass: 'vtt-age-badge-3to5',
    color: 'green',
    features: ['Simple words', 'Colorful pictures', 'Interactive elements']
  },
  '5-7': {
    label: 'Ages 5-7', 
    description: 'Beginning Readers',
    badgeClass: 'vtt-age-badge-5to7',
    color: 'blue',
    features: ['Short sentences', 'Picture support', 'Phonics practice']
  },
  '7-10': {
    label: 'Ages 7-10',
    description: 'Independent Readers', 
    badgeClass: 'vtt-age-badge-7to10',
    color: 'purple',
    features: ['Longer stories', 'Chapter books', 'Complex plots']
  }
} as const;

/**
 * Status configuration for stories
 */
export const STORY_STATUS = {
  draft: {
    label: 'Draft',
    badgeClass: 'vtt-badge-warning',
    description: 'Story is being created'
  },
  review: {
    label: 'Under Review',
    badgeClass: 'vtt-badge-info', 
    description: 'Story is being reviewed'
  },
  published: {
    label: 'Published',
    badgeClass: 'vtt-badge-success',
    description: 'Story is live and available'
  },
  archived: {
    label: 'Archived', 
    badgeClass: 'vtt-badge-gray',
    description: 'Story is no longer active'
  }
} as const;

/**
 * Button variant mapping
 */
export const BUTTON_VARIANTS = {
  primary: 'vtt-button-primary',
  secondary: 'vtt-button-secondary', 
  outline: 'vtt-button-outline',
  ghost: 'vtt-button-ghost',
  danger: 'vtt-button-danger',
  success: 'vtt-button-success'
} as const;

/**
 * Button size mapping
 */
export const BUTTON_SIZES = {
  sm: 'vtt-button-sm',
  default: '',
  lg: 'vtt-button-lg',
  xl: 'vtt-button-xl',
  icon: 'vtt-button-icon'
} as const;

/**
 * Typography mapping
 */
export const TYPOGRAPHY = {
  display1: 'vtt-display-1',
  display2: 'vtt-display-2',
  heading1: 'vtt-heading-1',
  heading2: 'vtt-heading-2',
  heading3: 'vtt-heading-3',
  heading4: 'vtt-heading-4',
  heading5: 'vtt-heading-5',
  heading6: 'vtt-heading-6',
  lead: 'vtt-lead',
  subtitle: 'vtt-subtitle',
  body: 'vtt-text-base',
  bodyLg: 'vtt-text-lg',
  bodySm: 'vtt-text-sm',
  caption: 'vtt-text-xs'
} as const;

/**
 * Spacing scale
 */
export const SPACING = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  base: '1rem',    // 16px
  lg: '1.25rem',   // 20px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '2.5rem', // 40px
  '4xl': '3rem',   // 48px
  '5xl': '4rem',   // 64px
  '6xl': '5rem'    // 80px
} as const;

/**
 * Generate button classes based on variant and size
 */
export function getButtonClasses(
  variant: keyof typeof BUTTON_VARIANTS = 'primary',
  size: keyof typeof BUTTON_SIZES = 'default'
) {
  return cn(
    'vtt-button',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size]
  );
}

/**
 * Generate age badge classes
 */
export function getAgeBadgeClass(ageGroup: keyof typeof AGE_GROUPS) {
  return AGE_GROUPS[ageGroup].badgeClass;
}

/**
 * Generate status badge classes  
 */
export function getStatusBadgeClass(status: keyof typeof STORY_STATUS) {
  return cn('vtt-badge', STORY_STATUS[status].badgeClass);
}

/**
 * Generate typography classes
 */
export function getTypographyClass(variant: keyof typeof TYPOGRAPHY) {
  return TYPOGRAPHY[variant];
}

/**
 * Validation utilities
 */
export const VALIDATION = {
  /**
   * Validate story title
   */
  storyTitle: (title: string) => {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('Title is required');
    } else if (title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    } else if (title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate story description
   */
  storyDescription: (description: string) => {
    const errors: string[] = [];
    
    if (!description.trim()) {
      errors.push('Description is required');
    } else if (description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    } else if (description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate email address
   */
  email: (email: string) => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Format utilities
 */
export const FORMAT = {
  /**
   * Format date to readable string
   */
  date: (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relativeTime: (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return FORMAT.date(d);
  },

  /**
   * Truncate text to specified length
   */
  truncate: (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  /**
   * Format number with commas
   */
  number: (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  }
};

/**
 * Animation utilities
 */
export const ANIMATIONS = {
  /**
   * Stagger animation delay for lists
   */
  staggerDelay: (index: number, baseDelay: number = 100) => ({
    animationDelay: `${index * baseDelay}ms`
  }),

  /**
   * Generate random float animation
   */
  randomFloat: () => ({
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  })
};

/**
 * Accessibility utilities
 */
export const A11Y = {
  /**
   * Generate ARIA label for age group
   */
  ageGroupLabel: (ageGroup: keyof typeof AGE_GROUPS) => {
    const config = AGE_GROUPS[ageGroup];
    return `Suitable for ${config.label} - ${config.description}`;
  },

  /**
   * Generate ARIA label for story status
   */
  statusLabel: (status: keyof typeof STORY_STATUS) => {
    const config = STORY_STATUS[status];
    return `Status: ${config.label} - ${config.description}`;
  },

  /**
   * Generate skip link for keyboard navigation
   */
  skipLink: (targetId: string, label: string) => ({
    href: `#${targetId}`,
    className: 'vtt-skip-link',
    children: `Skip to ${label}`
  })
};

/**
 * Theme utilities
 */
export const THEME = {
  /**
   * Get CSS custom property value
   */
  getCSSVar: (varName: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--vtt-${varName}`)
        .trim();
    }
    return '';
  },

  /**
   * Set CSS custom property value
   */
  setCSSVar: (varName: string, value: string) => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(`--vtt-${varName}`, value);
    }
  },

  /**
   * Toggle dark mode (future implementation)
   */
  toggleDarkMode: () => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('vtt-theme', isDark ? 'light' : 'dark');
    }
  }
};

/**
 * Local storage utilities
 */
export const STORAGE = {
  /**
   * Get item from localStorage with type safety
   */
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(`vtt-${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   */
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`vtt-${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`vtt-${key}`);
  }
};

/**
 * Responsive utilities
 */
export const RESPONSIVE = {
  /**
   * Check if screen is mobile size
   */
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },

  /**
   * Check if screen is tablet size
   */
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },

  /**
   * Check if screen is desktop size
   */
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  },

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint: (): 'mobile' | 'tablet' | 'desktop' => {
    if (RESPONSIVE.isDesktop()) return 'desktop';
    if (RESPONSIVE.isTablet()) return 'tablet';
    return 'mobile';
  }
};

/**
 * Export all utilities as a single object for easier imports
 */
export const VTTUtils = {
  cn,
  AGE_GROUPS,
  STORY_STATUS,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  TYPOGRAPHY,
  SPACING,
  getButtonClasses,
  getAgeBadgeClass,
  getStatusBadgeClass,
  getTypographyClass,
  VALIDATION,
  FORMAT,
  ANIMATIONS,
  A11Y,
  THEME,
  STORAGE,
  RESPONSIVE
};

export default VTTUtils;