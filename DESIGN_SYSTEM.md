# Design System Reference

This document provides a complete reference for all styling patterns, colors, and design tokens used throughout the application.

## Overview

All styling is centralized in `src/lib/design-tokens.ts`. This ensures consistency across the entire application.

## Quick Reference

### Import Design Tokens
```typescript
import { 
  backgrounds, 
  borders, 
  text, 
  icons, 
  radius, 
  buttons, 
  inputs,
  modals,
  cards,
  searchBar,
  textarea,
  tags,
  dropdowns
} from '@/lib/design-tokens';
```

## Background Layers

The app uses a layered glassmorphism system with 4 main layers:

| Layer | Opacity | Usage |
|-------|---------|-------|
| `layer1` | `bg-white/10` | Main content areas, cards, selected states |
| `layer2` | `bg-white/5` | Secondary content, inputs, buttons |
| `layer3` | `bg-white/3` | Subtle backgrounds, headers |
| `layer4` | `bg-white/2` | Very subtle backgrounds |

### Usage Examples

```tsx
// Main card
<div className={backgrounds.layer1}>
  Content
</div>

// Input field
<input className={backgrounds.layer2} />

// Hover state
<button className={`${backgrounds.layer2} ${backgrounds.hover.layer4}`}>
  Click me
</button>

// Selected state
<button className={backgrounds.selected.layer1}>
  Selected
</button>
```

### Modal Background
```tsx
<div 
  className={modals.wrapper.className}
  style={modals.wrapper.style}
>
  Modal content
</div>
```

## Borders

Three border opacity levels:

| Border | Opacity | Usage |
|--------|---------|-------|
| `primary` | `border-white/40` | Modal borders, important containers |
| `secondary` | `border-white/20` | Cards, inputs, buttons |
| `tertiary` | `border-white/10` | Subtle borders, dividers |

### Usage
```tsx
// Card with border
<div className={`${backgrounds.layer1} ${borders.secondary}`}>
  Card content
</div>

// Input with focus border
<input className={`${borders.secondary} ${borders.focus.secondary}`} />
```

## Text Colors

| Color | Opacity | Usage |
|-------|---------|-------|
| `primary` | `text-white` | Main text |
| `secondary` | `text-white/80` | Secondary text |
| `tertiary` | `text-white/70` | Tertiary text |
| `muted` | `text-white/60` | Muted text, placeholders |

### Usage
```tsx
<h1 className={text.primary}>Main Heading</h1>
<p className={text.secondary}>Secondary text</p>
<span className={text.muted}>Muted text</span>
```

## Icon Colors

**All icons use white for consistency.**

| Icon | Color | Usage |
|------|-------|-------|
| `primary` | `text-white` | Main icons |
| `secondary` | `text-white/80` | Secondary icons |
| `muted` | `text-white/60` | Muted icons |

### Usage
```tsx
<SearchIcon className={icons.primary} />
<InfoIcon className={icons.secondary} />
<HelpIcon className={icons.muted} />
```

## Corner Radius

Standardized corner radius values:

| Radius | Value | Usage |
|--------|-------|-------|
| `sm` | `rounded-md` (6px) | Small elements |
| `md` | `rounded-lg` (8px) | Default for most elements |
| `lg` | `rounded-xl` (12px) | Cards, containers |
| `xl` | `rounded-2xl` (16px) | Buttons, inputs |
| `2xl` | `rounded-3xl` (24px) | Large containers |
| `full` | `rounded-full` | Pills, circular elements |
| `input` | `rounded-[12px]` | Input fields |
| `modal` | `rounded-[32px]` | Modals |
| `button` | `rounded-2xl` | Buttons |
| `iconButton` | `rounded-xl` | Icon buttons |

### Usage
```tsx
// Button
<button className={radius.button}>Click</button>

// Input
<input className={radius.input} />

// Modal
<div className={radius.modal}>Modal</div>
```

## Buttons

### Base Button
```tsx
<button className={buttons.base.className}>
  Button Text
</button>
```

### With Size
```tsx
<button className={`${buttons.base.className} ${buttons.size.sm}`}>
  Small Button
</button>
```

### Selected State
```tsx
<button className={`${buttons.base.className} ${buttons.states.selected}`}>
  Selected
</button>
```

## Inputs

### Glass Input (Default)
```tsx
<input 
  className={`${inputs.base.className} ${inputs.variants.glass} ${inputs.size.sm}`}
/>
```

### Dark Input
```tsx
<input 
  className={`${inputs.base.className} ${inputs.variants.dark} ${inputs.size.sm}`}
/>
```

## Icon Buttons

```tsx
<button className={`${iconButtons.base.className} ${iconButtons.size.md}`}>
  <Icon className={icons.primary} />
</button>
```

## Modals

```tsx
<div 
  className={modals.wrapper.className}
  style={modals.wrapper.style}
>
  <div className={modals.overlay} />
  <div className={modals.content}>
    Modal content
  </div>
</div>
```

## Cards

```tsx
<div className={`${cards.base.className} ${cards.hover}`}>
  Card content
</div>
```

## Search Bars

```tsx
<div className="relative">
  <SearchIcon className={searchBar.icon.className} />
  <input className={searchBar.base.className} />
</div>
```

## Textareas

```tsx
<textarea className={textarea.base.className} />
```

## Tags/Badges

### Base Tag
```tsx
<span className={tags.base.className}>
  Tag
</span>
```

### Removable Tag
```tsx
<span className={tags.removable.className}>
  Tag <button>×</button>
</span>
```

### Clickable Tag
```tsx
<button className={tags.clickable.className}>
  Tag
</button>
```

## Dropdowns

```tsx
<div 
  className={dropdowns.base.className}
  style={dropdowns.base.style}
>
  <button className={dropdowns.item.className}>
    Item
  </button>
</div>
```

## Color Normalization Rules

### Backgrounds
- **Layer 1** (`bg-white/10`): Main content, cards, selected states
- **Layer 2** (`bg-white/5`): Inputs, buttons, secondary content
- **Layer 3** (`bg-white/3`): Headers, subtle backgrounds
- **Layer 4** (`bg-white/2`): Very subtle backgrounds

### Borders
- **Primary** (`border-white/40`): Modals only
- **Secondary** (`border-white/20`): Cards, inputs, buttons
- **Tertiary** (`border-white/10`): Subtle borders

### Text
- **Primary** (`text-white`): All main text
- **Secondary** (`text-white/80`): Secondary text
- **Muted** (`text-white/60`): Placeholders, muted text

### Icons
- **All icons**: `text-white` (normalized)
- **Secondary icons**: `text-white/80`
- **Muted icons**: `text-white/60`

## Migration Guide

When updating existing components:

1. **Replace hardcoded backgrounds:**
   ```tsx
   // Before
   <div className="bg-white/10 backdrop-blur-sm">
   
   // After
   <div className={backgrounds.layer1}>
   ```

2. **Replace hardcoded borders:**
   ```tsx
   // Before
   <div className="border border-white/20">
   
   // After
   <div className={borders.secondary}>
   ```

3. **Replace hardcoded text colors:**
   ```tsx
   // Before
   <p className="text-white/80">
   
   // After
   <p className={text.secondary}>
   ```

4. **Replace hardcoded icon colors:**
   ```tsx
   // Before
   <Icon className="text-white/80" />
   
   // After
   <Icon className={icons.primary} />
   ```

5. **Replace hardcoded radius:**
   ```tsx
   // Before
   <button className="rounded-2xl">
   
   // After
   <button className={radius.button}>
   ```

## Common Patterns

### Card with Hover
```tsx
<div className={`${backgrounds.layer1} ${borders.secondary} ${radius.card} ${backgrounds.hover.layer1} transition-all duration-300`}>
  Card content
</div>
```

### Input with Focus
```tsx
<input 
  className={`${inputs.base.className} ${inputs.variants.glass} ${inputs.size.sm}`}
/>
```

### Button with States
```tsx
<button 
  className={`${buttons.base.className} ${buttons.size.md} ${isSelected ? buttons.states.selected : buttons.states.default}`}
>
  Button
</button>
```

### Modal Container
```tsx
<div 
  className={modals.wrapper.className}
  style={modals.wrapper.style}
>
  {/* Modal content */}
</div>
```

## Notes

- All icons should use `icons.primary` (`text-white`) for consistency
- Background layers are progressive: layer1 > layer2 > layer3 > layer4
- Borders follow the same pattern: primary > secondary > tertiary
- Always use design tokens instead of hardcoded values
- When in doubt, check `src/lib/design-tokens.ts` for available options

