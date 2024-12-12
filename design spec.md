# SAUTI Design System Documentation

## 1. Color System

### Light Mode Colors (Default)

```css
/* Background Colors */
--light-bg-primary: #ffffff; /* Main background */
--light-bg-secondary: #f6f8fa; /* Secondary background */
--light-bg-tertiary: #f0f2f4; /* Tertiary background */

/* Text Colors */
--light-text-primary: #24292f; /* Primary text */
--light-text-secondary: #57606a; /* Secondary text */

/* Accent Colors */
--light-accent-primary: #0969da; /* Primary accent */
--light-accent-secondary: #218bff; /* Secondary accent */

/* Border & Effects */
--light-border: #d0d7de;
--light-hover-bg: #f3f4f6;
--light-shadow: rgba(31, 35, 40, 0.04);

/* Status Colors */
--light-success-bg: #dcfce7;
--light-success-text: #166534;
--light-warning-bg: #fef3c7;
--light-warning-text: #92400e;
--light-error-bg: #fee2e2;
--light-error-text: #991b1b;
--light-info-bg: #dbeafe;
--light-info-text: #1e40af;

/* Interactive Colors */
--light-upvote: #059669;
--light-upvote-bg: #ecfdf5;
--light-downvote: #dc2626;
--light-downvote-bg: #fef2f2;
```

### Dark Mode Colors

```css
/* Background Colors */
--dark-bg-primary: #0d1117; /* Main background */
--dark-bg-secondary: #161b22; /* Secondary background */
--dark-bg-tertiary: #21262d; /* Tertiary background */

/* Text Colors */
--dark-text-primary: #c9d1d9; /* Primary text */
--dark-text-secondary: #8b949e; /* Secondary text */

/* Accent Colors */
--dark-accent-primary: #58a6ff; /* Primary accent */
--dark-accent-secondary: #1f6feb; /* Secondary accent */

/* Border & Effects */
--dark-border: #30363d;
--dark-hover-bg: #1f2937;
--dark-shadow: rgba(0, 0, 0, 0.3);

/* Status Colors */
--dark-success-bg: #065f46;
--dark-success-text: #a7f3d0;
--dark-warning-bg: #78350f;
--dark-warning-text: #fcd34d;
--dark-error-bg: #7f1d1d;
--dark-error-text: #fecaca;
--dark-info-bg: #1e3a8a;
--dark-info-text: #bfdbfe;

/* Interactive Colors */
--dark-upvote: #34d399;
--dark-upvote-bg: #064e3b;
--dark-downvote: #f87171;
--dark-downvote-bg: #7f1d1d;
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

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
```

## 4. Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-full: 9999px;
```

## 5. Component Base Styles

### Buttons

```css
.btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: var(--duration-200);
}

.btn-primary {
  color: white;
  background-color: var(--accent-primary);
}

.btn-primary:hover {
  background-color: var(--accent-secondary);
}

.btn-secondary {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.btn-secondary:hover {
  background-color: var(--hover-bg);
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: var(--duration-200);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-primary);
}
```

### Cards

```css
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.card:hover {
  border-color: var(--accent-primary);
}
```

## 6. Status Indicators

### Success State

```css
.status-success {
  background-color: var(--success-bg);
  color: var(--success-text);
}
```

### Warning State

```css
.status-warning {
  background-color: var(--warning-bg);
  color: var(--warning-text);
}
```

### Error State

```css
.status-error {
  background-color: var(--error-bg);
  color: var(--error-text);
}
```

### Info State

```css
.status-info {
  background-color: var(--info-bg);
  color: var(--info-text);
}
```

## 7. Interactive Elements

### Voting System

```css
.upvote {
  color: var(--upvote);
  background-color: var(--upvote-bg);
}

.downvote {
  color: var(--downvote);
  background-color: var(--downvote-bg);
}
```

## 8. Layout & Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}
```

## 9. Utility Classes

### Transitions

```css
.transition-base {
  transition-property: color, background-color, border-color;
  transition-duration: var(--duration-200);
}
```

### Focus States

```css
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-primary);
}
```

### Text Colors

```css
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-accent {
  color: var(--accent-primary);
}
```

### Background Colors

```css
.bg-base {
  background-color: var(--bg-primary);
}

.bg-base-secondary {
  background-color: var(--bg-secondary);
}

.bg-base-tertiary {
  background-color: var(--bg-tertiary);
}
```
