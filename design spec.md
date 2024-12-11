# SAUTI Design System Documentation

## 1. Color System

### Primary Colors

```css
/* Theme Variables */
--accent-primary: #0969da; /* Primary brand color, used for CTAs, links, and important actions */
--accent-secondary: #218bff; /* Secondary brand color, used for hover states */
```

### Background Colors

```css
--bg-primary: #ffffff; /* Main background color (Light Mode) */
--bg-secondary: #f6f8fa; /* Secondary background, used for cards and sections */
--bg-tertiary: #f0f2f4; /* Tertiary background, used for interactive elements */
--dark-bg-primary: #0d1117; /* Main background color (Dark Mode) */
--dark-bg-secondary: #161b22; /* Secondary background (Dark Mode) */
--dark-bg-tertiary: #21262d; /* Tertiary background (Dark Mode) */
```

### Text Colors

```css
--text-primary: #24292f; /* Primary text color */
--text-secondary: #57606a; /* Secondary text color, used for less emphasis */
--dark-text-primary: #c9d1d9; /* Primary text color (Dark Mode) */
--dark-text-secondary: #8b949e; /* Secondary text color (Dark Mode) */
```

### Border Colors

```css
--border: #d0d7de; /* Default border color */
--dark-border: #30363d; /* Border color (Dark Mode) */
```

## 2. Typography

### Font Families

```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
  sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 3. Spacing System

### Base Spacing Units

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
```

### Common Component Spacing

- Card Padding: `p-6` (1.5rem)
- Section Padding: `py-12` (3rem vertical)
- Grid Gap: `gap-8` (2rem)
- Stack Space: `space-y-4` (1rem)

## 4. Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-full: 9999px;
```

## 5. Component Styles

### Buttons

#### Primary Button

```css
.btn-primary {
  @apply px-4 py-2 text-sm font-medium text-white 
  bg-accent-primary hover:bg-accent-secondary 
  rounded-md transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary;
}
```

#### Secondary Button

```css
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-text-primary 
  bg-bg-secondary hover:bg-hover-bg 
  rounded-md transition-colors duration-200;
}
```

### Form Elements

#### Input Fields

```css
.input-field {
  @apply w-full px-3 py-2 bg-bg-primary 
  border border-border rounded-md 
  text-text-primary placeholder-text-secondary 
  focus:outline-none focus:ring-2 focus:ring-accent-primary 
  focus:border-transparent transition-colors duration-200;
}
```

#### Text Areas

```css
.textarea-field {
  @apply input-field resize-none;
}
```

### Cards

```css
.card {
  @apply bg-bg-primary border border-border rounded-lg 
  p-6 hover:border-border-hover transition-colors duration-200;
}
```

## 6. Layout System

### Grid System

- Uses CSS Grid with responsive columns
- Common patterns:

```css
/* Two Columns */
grid-cols-1 md:grid-cols-2

/* Three Columns */
grid-cols-1 md:grid-cols-3

/* Sidebar Layout */
grid-cols-1 lg:grid-cols-12
```

### Container Widths

```css
.container {
  max-width: 1280px; /* 7xl in Tailwind */
  @apply mx-auto px-4 sm:px-6 lg:px-8;
}
```

## 7. Animation & Transitions

### Duration

```css
--duration-200: 200ms; /* Default transition duration */
```

### Common Transitions

```css
.transition-base {
  @apply transition-colors duration-200;
}
```

## 8. Interactive States

### Hover States

- Buttons: Darker/lighter variant of base color
- Cards: Subtle border color change
- Links: Color change with no underline

### Focus States

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 
  focus:ring-offset-2 focus:ring-accent-primary;
}
```

### Disabled States

```css
.disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

## 9. Responsive Design

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Mobile-First Approach

- All styles are written for mobile first
- Use responsive modifiers for larger screens
- Example: `text-sm md:text-base lg:text-lg`

## 10. Dark Mode Support

### Implementation

- Uses CSS variables for color switching
- Controlled by `data-theme="dark"` attribute
- Automatic system preference detection
- Manual toggle support

### Color Mapping

```css
[data-theme="dark"] {
  --bg-primary: var(--dark-bg-primary);
  --bg-secondary: var(--dark-bg-secondary);
  --text-primary: var(--dark-text-primary);
  --text-secondary: var(--dark-text-secondary);
  --border: var(--dark-border);
}
```

## 11. Accessibility

### Color Contrast

- All color combinations meet WCAG 2.1 AA standards
- Text colors maintain 4.5:1 contrast ratio
- Interactive elements maintain 3:1 contrast ratio

### Focus Indicators

- Visible focus rings on all interactive elements
- High contrast focus states
- Keyboard navigation support

## 12. Icons

### Icon System

- Uses SVG icons inline
- Consistent sizing: `w-5 h-5` (1.25rem)
- Color inheritance from text color
- Supports both stroke and fill variants

This design system ensures consistency across the application while maintaining flexibility for different contexts and requirements. It's built with accessibility, responsiveness, and maintainability in mind.
