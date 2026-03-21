# Fenix Platform - Professional Design System

## Design Philosophy
The Fenix Platform uses a modern, bright, and professional design system that emphasizes:
- **Clarity**: Clean layouts with proper spacing and hierarchy
- **Efficiency**: Quick visual scanning with color-coded status indicators
- **Professionalism**: Polished UI with smooth animations and transitions
- **Accessibility**: High contrast ratios and clear typography

## Color Palette

### Primary Colors
- **Primary Orange**: `#f59e0b` - Main brand color, used for CTAs and highlights
- **Primary Dark**: `#d97706` - Hover states and emphasis
- **Primary Light**: `#fbbf24` - Gradients and accents

### Semantic Colors
- **Success**: `#10b981` - Completed states, positive actions
- **Danger**: `#ef4444` - Errors, destructive actions
- **Warning**: `#f59e0b` - Pending states, cautions
- **Info**: `#3b82f6` - Informational messages

### Neutral Colors
- **Background Primary**: `#ffffff` - Cards, modals
- **Background Secondary**: `#f8fafc` - Page background
- **Background Tertiary**: `#f1f5f9` - Table headers, disabled states
- **Text Primary**: `#0f172a` - Main content
- **Text Secondary**: `#475569` - Labels, secondary content
- **Text Muted**: `#64748b` - Placeholders, hints
- **Border**: `#e2e8f0` - Dividers, card borders

## Typography

### Font Family
- Primary: `Inter` (Google Fonts)
- Fallback: System fonts for performance

### Font Weights
- Light: 300 - Subtle text
- Regular: 400 - Body text
- Medium: 500 - Labels
- Semibold: 600 - Buttons, emphasis
- Bold: 700 - Headings
- Extrabold: 800 - Hero text

### Font Sizes
- Small: 0.75rem (12px) - Badges, captions
- Base: 0.95rem (15px) - Body text
- Medium: 1rem (16px) - Inputs
- Large: 1.25rem (20px) - Subheadings
- XL: 1.5rem (24px) - Page titles
- 2XL: 2rem (32px) - Hero text

## Spacing System
Based on 8px grid:
- XS: 0.25rem (4px)
- SM: 0.5rem (8px)
- MD: 1rem (16px)
- LG: 1.5rem (24px)
- XL: 2rem (32px)
- 2XL: 3rem (48px)

## Border Radius
- Small: 8px - Inputs, buttons
- Medium: 12px - Cards
- Large: 16px - Modals
- Full: 50% - Avatars, status dots

## Shadows
- Light: `0 1px 3px rgba(0, 0, 0, 0.08)` - Cards at rest
- Medium: `0 4px 12px rgba(0, 0, 0, 0.12)` - Cards on hover
- Heavy: `0 20px 40px rgba(0, 0, 0, 0.15)` - Modals, dropdowns

## Components

### Cards
- White background with subtle border
- Hover effect: lift with enhanced shadow
- Smooth transitions (0.2s ease)

### Buttons
- Primary: Orange gradient with white text
- Secondary: Light gray with border
- Hover: Lift effect (-2px translateY)
- Active: Press effect (0px translateY)
- Disabled: 50% opacity

### Tables
- Striped rows on hover
- Sticky headers for long lists
- Responsive: horizontal scroll on mobile
- Status indicators: colored dots with pulse animation

### Forms
- Consistent padding (0.75rem 1rem)
- Focus state: orange border + subtle shadow
- Error state: red border + error message
- Success state: green border

### Status Indicators
- Green dot (●): Completed
- Orange text: Pending/Missing
- Red: Error/Failed
- Pulse animation for active states

## Animations

### Transitions
- Default: `all 0.2s ease`
- Hover effects: 0.3s cubic-bezier
- Page transitions: 0.5s ease-out

### Keyframes
- **fadeIn**: Opacity 0→1 + translateY 10px→0
- **slideIn**: translateX -20px→0 + opacity 0→1
- **pulse**: Opacity 1→0.5→1 (2s loop)
- **spin**: Rotate 360deg (0.8s loop)

## Layout

### Dashboard
- 4-column grid for stat cards
- Responsive: 2 columns on tablet, 1 on mobile
- Table with fixed header
- Balance cards at bottom

### Forms
- 2-column grid for inputs
- Full-width for textareas
- Grouped related fields
- Clear visual hierarchy

### Navigation
- Sidebar: Fixed left, 240px width
- Collapsible on mobile
- Active state: orange background
- Icons + labels for clarity

## Accessibility

### Contrast Ratios
- Text on white: 7:1 (AAA)
- Orange on white: 4.5:1 (AA)
- All interactive elements: 3:1 minimum

### Focus States
- Visible focus ring (3px orange shadow)
- Keyboard navigation support
- Skip links for screen readers

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly targets (44px minimum)

## Best Practices

### Performance
- CSS variables for theming
- Hardware-accelerated animations (transform, opacity)
- Lazy loading for images
- Minimal repaints/reflows

### Consistency
- Use design tokens (CSS variables)
- Reusable component styles
- Consistent spacing rhythm
- Predictable interactions

### User Experience
- Immediate feedback on actions
- Loading states for async operations
- Error messages with recovery actions
- Success confirmations

## Future Enhancements
- Dark mode support
- Custom themes per user
- Advanced data visualizations
- Real-time updates with WebSocket
- Progressive Web App (PWA) features
