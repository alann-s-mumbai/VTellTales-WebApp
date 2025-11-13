# VTellTales Design System Documentation

## Overview

The VTellTales Design System is a comprehensive collection of reusable components, utilities, and guidelines for building consistent and accessible user interfaces for the VTellTales storytelling platform.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)
7. [Accessibility](#accessibility)
8. [Implementation](#implementation)

## Design Principles

### 1. Child-Friendly
- Bright, vibrant colors that appeal to children
- Large, clear typography
- Intuitive navigation and interactions
- Visual hierarchy that guides young users

### 2. Educational
- Clear distinction between different story age groups
- Progress indicators for learning journeys
- Visual feedback for completed activities

### 3. Accessible
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation support
- Screen reader compatibility

### 4. Responsive
- Mobile-first design approach
- Flexible layouts for all screen sizes
- Touch-friendly interface elements

## Color System

### Primary Brand Colors

```css
--vtt-primary-yellow: #F3D657    /* Main brand color */
--vtt-primary-blue: #5BCCF6      /* Secondary brand color */
--vtt-primary-white: #FFFFFF     /* Light backgrounds */
--vtt-primary-black: #1A1A1A     /* Dark text */
```

### Accent Colors

```css
--vtt-accent-orange: #FF6B35     /* Call-to-action, warnings */
--vtt-accent-green: #4CAF50      /* Success, positive actions */
--vtt-accent-red: #E53E3E        /* Errors, destructive actions */
--vtt-accent-purple: #8B5CF6     /* Special features */
```

### Age Group Colors

- **Ages 3-5**: Green (`--vtt-accent-green`) - Early learning
- **Ages 5-7**: Blue (`--vtt-primary-blue`) - Elementary reading
- **Ages 7-10**: Purple (`--vtt-accent-purple`) - Advanced stories

### Neutral Grays

```css
--vtt-gray-50: #FAFAFA          /* Lightest backgrounds */
--vtt-gray-100: #F5F5F5         /* Card backgrounds */
--vtt-gray-200: #E5E5E5         /* Borders */
--vtt-gray-300: #D4D4D4         /* Disabled states */
--vtt-gray-400: #A3A3A3         /* Placeholder text */
--vtt-gray-500: #737373         /* Secondary text */
--vtt-gray-600: #525252         /* Body text */
--vtt-gray-700: #404040         /* Headings */
--vtt-gray-800: #262626         /* Dark backgrounds */
--vtt-gray-900: #171717         /* Darkest text */
```

## Typography

### Font Families

- **Primary**: `--vtt-font-primary` - System fonts for body text
- **Headings**: `--vtt-font-heading` - Poppins for headings
- **Monospace**: `--vtt-font-mono` - Code and technical text

### Typography Scale

| Class | Size | Usage |
|-------|------|-------|
| `vtt-display-1` | 60-96px | Hero titles |
| `vtt-display-2` | 48-84px | Page titles |
| `vtt-heading-1` | 48-60px | Section headers |
| `vtt-heading-2` | 36-48px | Subsection headers |
| `vtt-heading-3` | 30-36px | Component titles |
| `vtt-heading-4` | 24-30px | Card headers |
| `vtt-heading-5` | 20-24px | Form labels |
| `vtt-heading-6` | 18-20px | Small headers |
| `vtt-text-lg` | 18px | Lead text |
| `vtt-text-base` | 16px | Body text |
| `vtt-text-sm` | 14px | Secondary text |
| `vtt-text-xs` | 12px | Captions |

### Specialized Typography

- `vtt-brand-title` - Gradient brand text
- `vtt-storytelling-text` - Story content styling
- `vtt-gradient-text` - Yellow-orange gradient text

## Spacing & Layout

### Spacing Scale

```css
--vtt-spacing-1: 4px      /* Tight spacing */
--vtt-spacing-2: 8px      /* Button padding */
--vtt-spacing-3: 12px     /* Form elements */
--vtt-spacing-4: 16px     /* Card padding */
--vtt-spacing-5: 20px     /* Section spacing */
--vtt-spacing-6: 24px     /* Component margins */
--vtt-spacing-8: 32px     /* Large spacing */
--vtt-spacing-12: 48px    /* Section padding */
--vtt-spacing-16: 64px    /* Page sections */
--vtt-spacing-20: 80px    /* Major sections */
```

### Container System

- `vtt-container` - Max-width 1280px with responsive padding
- `vtt-container-sm` - Max-width 640px for narrow content
- `vtt-container-lg` - Max-width 1024px for wide layouts
- `vtt-container-fluid` - Full width with padding

### Grid System

- `vtt-grid-1` to `vtt-grid-6` - Responsive grid columns
- `vtt-grid-auto` - Auto-fit grid with 280px minimum
- `vtt-grid-story` - Specialized story card grid

## Components

### Buttons

#### Primary Buttons
```html
<button class="vtt-button vtt-button-primary">
  Create Story
</button>
```

#### Secondary Buttons
```html
<button class="vtt-button vtt-button-secondary">
  Learn More
</button>
```

#### Button Variants
- `vtt-button-primary` - Main call-to-action
- `vtt-button-secondary` - Secondary actions
- `vtt-button-outline` - Outlined style
- `vtt-button-ghost` - Text-only style
- `vtt-button-danger` - Destructive actions
- `vtt-button-success` - Positive actions

#### Button Sizes
- `vtt-button-sm` - Small buttons (32px height)
- `vtt-button` - Default (40px height)
- `vtt-button-lg` - Large buttons (48px height)
- `vtt-button-xl` - Extra large (56px height)

### Cards

#### Basic Card
```html
<div class="vtt-card">
  <div class="vtt-card-header">
    <h3>Story Title</h3>
  </div>
  <div class="vtt-card-body">
    <p>Story content goes here...</p>
  </div>
  <div class="vtt-card-footer">
    <button class="vtt-button vtt-button-primary">Read Story</button>
  </div>
</div>
```

#### Story Card
```html
<div class="vtt-story-card">
  <div class="vtt-story-card-image">
    <img src="story-cover.jpg" alt="Story cover">
  </div>
  <div class="vtt-story-card-content">
    <h3 class="vtt-story-title">Adventure in the Forest</h3>
    <span class="vtt-age-badge-5to7">Ages 5-7</span>
  </div>
</div>
```

### Forms

#### Form Structure
```html
<form class="vtt-form">
  <div class="vtt-form-group">
    <label class="vtt-label vtt-label-required">Story Title</label>
    <input type="text" class="vtt-input" placeholder="Enter story title">
    <span class="vtt-help-text">Choose a catchy title for your story</span>
  </div>
  
  <div class="vtt-form-actions">
    <button type="button" class="vtt-button vtt-button-outline">Cancel</button>
    <button type="submit" class="vtt-button vtt-button-primary">Save Story</button>
  </div>
</form>
```

#### Input Types
- `vtt-input` - Text inputs
- `vtt-textarea` - Textarea elements
- `vtt-select` - Select dropdowns

#### Form States
- `vtt-input-error` - Error state styling
- `vtt-label-required` - Required field indicator

### Navigation

#### Sidebar Navigation
```html
<nav class="vtt-sidebar-nav">
  <a href="#" class="vtt-nav-link vtt-nav-link-active">
    <svg>...</svg>
    Dashboard
  </a>
  <a href="#" class="vtt-nav-link">
    <svg>...</svg>
    My Stories
  </a>
</nav>
```

### Badges & Status

#### Age Badges
```html
<span class="vtt-age-badge-3to5">Ages 3-5</span>
<span class="vtt-age-badge-5to7">Ages 5-7</span>
<span class="vtt-age-badge-7to10">Ages 7-10</span>
```

#### Status Badges
```html
<span class="vtt-badge vtt-badge-success">Published</span>
<span class="vtt-badge vtt-badge-warning">Draft</span>
<span class="vtt-badge vtt-badge-danger">Archived</span>
```

### Loading States

#### Spinner
```html
<div class="vtt-spinner"></div>
```

#### Skeleton Loading
```html
<div class="vtt-skeleton w-full h-4 mb-2"></div>
<div class="vtt-skeleton w-3/4 h-4"></div>
```

## Usage Guidelines

### Color Usage

1. **Primary Yellow**: Use for primary actions, highlights, and brand elements
2. **Primary Blue**: Use for secondary actions and informational content
3. **Orange**: Use sparingly for urgent actions or highlights
4. **Green**: Use for success states and positive feedback
5. **Red**: Use only for errors and destructive actions

### Typography Hierarchy

1. Start with `vtt-heading-1` for page titles
2. Use `vtt-heading-3` for major sections
3. Use `vtt-heading-5` for component titles
4. Keep body text at `vtt-text-base` (16px minimum)

### Spacing Consistency

- Use consistent spacing multiples (4px, 8px, 16px, 24px, 32px)
- Maintain visual rhythm with `vtt-section` classes
- Use `vtt-space-y-*` utilities for consistent vertical spacing

## Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: Clear focus indicators

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators use `vtt-focus-ring` utility
- Tab order follows logical content flow

### Screen Readers

- Semantic HTML structure
- ARIA labels where needed
- Skip links for main navigation
- Alternative text for all images

### Motion & Animation

- Respects `prefers-reduced-motion`
- Subtle animations that don't interfere with usability
- Optional animation controls for user preference

## Implementation

### Getting Started

1. Import the master stylesheet:
```css
@import './styles/index.css';
```

2. Use utility classes:
```html
<div class="vtt-container vtt-section">
  <h1 class="vtt-heading-1 vtt-gradient-text">Welcome to VTellTales</h1>
  <p class="vtt-text-lg">Create magical stories for children</p>
</div>
```

### Custom Components

When creating new components:

1. Follow the naming convention: `vtt-[component-name]`
2. Use existing utility classes when possible
3. Maintain consistency with existing patterns
4. Test across all breakpoints
5. Ensure accessibility compliance

### File Structure

```
src/styles/
├── index.css           # Master stylesheet
├── variables.css       # CSS custom properties
├── typography.css      # Typography system
├── components.css      # Component styles
└── layouts.css         # Layout utilities
```

### Customization

To customize the design system:

1. Override CSS custom properties in `variables.css`
2. Extend components in `components.css`
3. Add new utilities in the utilities layer
4. Follow the established patterns and naming conventions

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+

## Performance

- CSS custom properties for theming
- Minimal CSS bundle size with Tailwind's purging
- Optimized for critical CSS extraction
- Reduced layout shifts with consistent sizing

## Contributing

When contributing to the design system:

1. Test components across all supported browsers
2. Ensure accessibility compliance
3. Document new patterns and usage
4. Update this documentation with changes
5. Follow the established coding standards

---

*Last updated: November 2025*
*Version: 1.0.0*