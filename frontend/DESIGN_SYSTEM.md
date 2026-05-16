# EEP Enterprise Portal Design System

A premium, modern, and elegant design system inspired by Stripe, Linear, and Vercel.

## Brand Identity
- **Primary (Green):** `#1E590C` (Growth, Stability, Professionalism)
- **Accent (Red):** `#DD1407` (Action, Energy, Importance)

## UI Tokens

### Typography
- **Font Family:** `Inter`, system-ui.
- **Scale:** 
  - `text-xs`: 12px
  - `text-sm`: 14px (Default for UI)
  - `text-base`: 16px (Default for Content)
  - `text-lg`: 18px
  - `text-xl`: 20px
  - `text-2xl`: 24px

### Spacing
Base 4px system (`--space-n`):
- `1`: 4px | `2`: 8px | `3`: 12px | `4`: 16px | `6`: 24px | `8`: 32px

### Elevation (Shadows)
- **Border Shadow:** Subtle 1px inner border for depth.
- **Premium Shadow:** Multi-layered shadow for cards.
- **Elevation levels:** `sm`, `md`, `lg`.

## Tailwind Configuration Recommendation

If you choose to use Tailwind CSS, add this to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#1E590C',
            hover: '#18470A',
            subtle: '#F1F8F0',
          },
          red: {
            DEFAULT: '#DD1407',
            hover: '#C21106',
            subtle: '#FFF1F0',
          }
        },
        neutral: {
          surface: 'var(--bg-surface)',
          app: 'var(--bg-app)',
        }
      },
      borderRadius: {
        'premium': '0.5rem', // 8px
      },
      boxShadow: {
        'premium': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0, 0, 0, 0.04)',
      }
    }
  }
}
```

## Reusable Component Strategy

### 1. Angular Components
Use **Composition** over configuration. Create small, atomic components.
- Use `btn-premium` class for buttons.
- Use `card-premium` for containers.
- Use `input-premium` for forms.

### 2. Styling Approach
- **Global:** Use the CSS variables defined in `_tokens.scss`.
- **Component-specific:** Use SCSS in the component folder for layout, but reference global tokens.
- **Utility-First:** Leverage PrimeFlex (already in project) or Tailwind for layout (padding, margin, flex).

## Dark/Light Mode
The system supports dark mode via `data-theme="dark"` attribute on the `<html>` or `<body>` tag.
- **Light:** Neutral 50 background, White surfaces.
- **Dark:** Neutral 950 background, Neutral 900 surfaces.

## Animation Guidelines
- **Entrance:** Use `animate-slide-up` for new page content.
- **Interactions:** All buttons and cards should have `transition-base`.
- **Hover:** Subtle scale (1.02x) or lift (-2px) for interactive elements.
