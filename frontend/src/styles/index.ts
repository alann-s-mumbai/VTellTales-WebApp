/**
 * VtellTales: WebApp Design System - Main Export File
 * 
 * This file provides a centralized way to import all design system 
 * components, utilities, and types.
 */

// Re-export the utility function
export { cn } from '../utils/design-system';

// Type definitions for the design system
export type AgeGroup = '3-5' | '5-7' | '7-10';
export type StoryStatus = 'draft' | 'review' | 'published' | 'archived';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'small' | 'default' | 'large';

// Design system configuration
export const COLORS = {
  primary: {
    yellow: '#F3D657',
    blue: '#5BCCF6',
    orange: '#FFA07A'
  },
  secondary: {
    purple: '#9B7FBD',
    pink: '#FFB6C1',
    green: '#90EE90'
  }
} as const;

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem', 
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
} as const;

// Default export for the complete design system
export const VtellTalesWebAppDesignSystem = {
  COLORS,
  SPACING,
  types: {
    AgeGroup: ['3-5', '5-7', '7-10'] as const,
    StoryStatus: ['draft', 'review', 'published', 'archived'] as const,
    ButtonVariant: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'] as const,
    ButtonSize: ['small', 'default', 'large'] as const
  }
};

export default VtellTalesWebAppDesignSystem;