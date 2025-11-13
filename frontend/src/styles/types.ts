/**
 * VtellTales: WebApp Design System - Main Export File
 * 
 * This file provides type definitions and configuration for the VtellTales: WebApp Design System
 */

// Type definitions for the design system
export type AgeGroup = '3-5' | '5-7' | '7-10';
export type StoryStatus = 'draft' | 'review' | 'published' | 'archived';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'xl' | 'icon';
export type TypographyVariant = 'display1' | 'display2' | 'heading1' | 'heading2' | 'heading3' | 
  'heading4' | 'heading5' | 'heading6' | 'lead' | 'subtitle' | 'body' | 'bodyLg' | 'bodySm' | 'caption';
export type AlertType = 'info' | 'success' | 'warning' | 'error';

// Design System Configuration
export const DESIGN_SYSTEM_CONFIG = {
  version: '1.0.0',
  prefix: 'vtt',
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  colors: {
    primary: {
      yellow: '#F3D657',
      blue: '#5BCCF6',
      white: '#FFFFFF',
      black: '#1A1A1A'
    },
    accent: {
      orange: '#FF6B35',
      green: '#4CAF50',
      red: '#E53E3E',
      purple: '#8B5CF6'
    }
  },
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace'
  }
} as const;

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface StoryCardProps extends BaseComponentProps {
  title: string;
  description: string;
  ageGroup: AgeGroup;
  imageUrl: string;
  isPublished: boolean;
  onClick?: () => void;
}

export interface StoryFormData {
  title: string;
  description: string;
  ageGroup: AgeGroup;
  category: string;
}

export interface StoryFormProps extends BaseComponentProps {
  onSubmit: (data: StoryFormData) => void;
  initialData?: Partial<StoryFormData>;
  isLoading?: boolean;
}

export interface AlertProps extends BaseComponentProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

// Design system validation schema
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Re-export utilities for easier access
export { default as VTTUtils } from '../utils/design-system';