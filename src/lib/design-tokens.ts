/**
 * DESIGN TOKENS - Centralized Style System
 * 
 * This file contains all design tokens for colors, backgrounds, borders,
 * corner radius, icons, typography, and other styling patterns used throughout the app.
 * 
 * All components should reference these tokens for consistency.
 * 
 * Typography: Source Code Pro is used for all text throughout the application.
 * The font is loaded from Google Fonts and configured via CSS variables.
 */

// ============================================================================
// BACKGROUND LAYERS (Glassmorphism)
// ============================================================================
export const backgrounds = {
  // Primary background layers (from most opaque to least)
  layer1: 'bg-white/10 backdrop-blur-sm',        // Main content areas, cards
  layer2: 'bg-white/5 backdrop-blur-sm',         // Secondary content, inputs
  layer3: 'bg-white/3 backdrop-blur-sm',         // Subtle backgrounds, headers
  layer4: 'bg-white/2 backdrop-blur-sm',         // Very subtle backgrounds
  
  // Stronger blur variants
  layer1Strong: 'bg-white/10 backdrop-blur-xl',  // Modals, important cards
  layer2Strong: 'bg-white/5 backdrop-blur-xl',   // Detail views
  
  // Modal background (solid with blur)
  modal: {
    className: 'backdrop-blur-xl',
    style: { backgroundColor: 'rgba(149, 153, 160, 0.90)' }
  },
  
  // Interactive states
  hover: {
    layer1: 'hover:bg-white/20',   // Hover on layer1
    layer2: 'hover:bg-white/15',  // Hover on layer2
    layer3: 'hover:bg-white/10',  // Hover on layer3
    layer4: 'hover:bg-white/8',   // Hover on layer4
    layer5: 'hover:bg-white/5',   // Subtle hover
  },
  
  // Selected/Active states
  selected: {
    layer1: 'bg-white/15',        // Selected buttons, active items
    layer2: 'bg-white/20',        // Strong selected state
  },
  
  // Overlay
  overlay: 'bg-white/95',
  
  // Light theme (for Detail view)
  light: {
    base: 'bg-white',
    subtle: 'bg-gray-50',
    hover: 'bg-gray-100',
  }
};

// ============================================================================
// BORDERS
// ============================================================================
export const borders = {
  // Border colors (from most visible to least)
  primary: 'border-white/40',      // Modal borders, important containers
  secondary: 'border-white/20',     // Cards, inputs, buttons
  tertiary: 'border-white/10',      // Subtle borders, dividers
  quaternary: 'border-white/5',     // Very subtle borders
  
  // Interactive states
  hover: {
    primary: 'hover:border-white/20',
    secondary: 'hover:border-white/15',
  },
  
  // Focus states
  focus: {
    primary: 'focus:border-white/20',
    secondary: 'focus:ring-2 focus:ring-white/20',
  },
  
  // Light theme
  light: {
    primary: 'border-gray-200',
    secondary: 'border-gray-300',
    focus: 'border-blue-500',
  }
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const typography = {
  // Font family - Source Code Pro for all text
  fontFamily: {
    body: 'font-[var(--body-font-family)]',      // Uses "Source Code Pro", monospace
    button: 'font-[var(--button-font-family)]',  // Uses "Source Code Pro", monospace
    header: 'font-[var(--x-small-header-font-family)]', // Uses "Source Code Pro", monospace
    default: 'font-sans',                        // Tailwind default (Source Code Pro via config)
  },
  
  // Font weights
  weight: {
    normal: 'font-normal',     // 400
    medium: 'font-medium',     // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',         // 700
  },
  
  // Font sizes (using Tailwind defaults)
  size: {
    xs: 'text-xs',    // 12px
    sm: 'text-sm',    // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',    // 18px
    xl: 'text-xl',    // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
  },
  
  // Legacy scale (for backward compatibility with typography component)
  scale: {
    h1: 'text-base font-semibold leading-relaxed',
    h2: 'text-base font-semibold leading-relaxed',
    h3: 'text-base font-semibold leading-relaxed',
    body: 'text-base leading-relaxed',
    small: 'text-base leading-relaxed',
    caption: 'text-base leading-relaxed',
  },
  
  // Text colors (for backward compatibility)
  colors: {
    primary: 'text-white',      // Main text
    secondary: 'text-white/80',  // Secondary text
    muted: 'text-white/60',     // Muted text
  }
};

// ============================================================================
// TEXT COLORS
// ============================================================================
export const text = {
  // Primary text colors
  primary: 'text-white',           // Main text
  secondary: 'text-white/80',       // Secondary text
  tertiary: 'text-white/70',       // Tertiary text
  muted: 'text-white/60',          // Muted text, placeholders
  disabled: 'text-white/40',       // Disabled text
  
  // Interactive states
  hover: 'hover:text-white',
  
  // Light theme
  light: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
  }
};

// ============================================================================
// ICON COLORS
// ============================================================================
export const icons = {
  // All icons use white for consistency
  primary: 'text-white',            // Main icons
  secondary: 'text-white/80',      // Secondary icons
  muted: 'text-white/60',          // Muted icons
  disabled: 'text-white/40',       // Disabled icons
  
  // Interactive states
  hover: 'hover:text-white',
  
  // Special states
  active: 'text-white',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  success: 'text-green-400',
  
  // Light theme
  light: {
    primary: 'text-gray-700',
    secondary: 'text-gray-500',
  }
};

// ============================================================================
// CORNER RADIUS
// ============================================================================
export const radius = {
  // Standard radius values
  none: 'rounded-none',
  sm: 'rounded-md',                 // 6px - Small elements
  md: 'rounded-lg',                 // 8px - Default for most elements
  lg: 'rounded-xl',                 // 12px - Cards, containers
  xl: 'rounded-2xl',                 // 16px - Buttons, inputs
  '2xl': 'rounded-3xl',              // 24px - Large containers
  full: 'rounded-full',              // Pills, circular elements
  
  // Custom values
  input: 'rounded-[12px]',          // Input fields
  modal: 'rounded-[32px]',          // Modals
  card: 'rounded-xl',                // Cards
  button: 'rounded-2xl',             // Buttons
  iconButton: 'rounded-xl',          // Icon buttons
  searchBar: 'rounded-2xl',          // Search bars
};

// ============================================================================
// BUTTON STYLES
// ============================================================================
export const buttons = {
  // Base button styles
  base: {
    className: 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:scale-105 active:scale-95 hover:bg-white/8 hover:border-white/20 focus:ring-white/20',
  },
  
  // Size variants
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
  
  // State variants
  states: {
    default: 'bg-white/5 backdrop-blur-sm border border-white/10 text-white',
    selected: 'bg-white/15 border-white/25 shadow-lg text-white',
    disabled: 'opacity-50 cursor-not-allowed hover:scale-100 text-white',
  },
};

// ============================================================================
// INPUT STYLES
// ============================================================================
export const inputs = {
  // Base input styles
  base: {
    className: [
      'block w-full appearance-none',
      'transition-colors duration-200',
      'border focus:outline-none focus:ring-2',
      radius.input,
    ].join(' '),
  },
  
  // Color variants
  variants: {
    glass: [
      backgrounds.layer2,
      text.primary,
      borders.secondary,
      'placeholder:text-white/60 placeholder:text-xs',
      borders.focus.secondary,
      backgrounds.hover.layer4,
    ].join(' '),
    dark: [
      'bg-neutral-800 text-white border-neutral-700',
      'placeholder:text-neutral-400 placeholder:text-xs',
      'focus:ring-neutral-600 focus:border-neutral-600',
    ].join(' '),
    light: [
      'bg-white text-gray-900 border-gray-200',
      'placeholder:text-white placeholder:text-xs',
      'focus:ring-gray-900 focus:border-gray-900',
    ].join(' '),
  },
  
  // Size variants
  size: {
    sm: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  },
};

// ============================================================================
// ICON BUTTON STYLES
// ============================================================================
export const iconButtons = {
  base: {
    className: 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:scale-105 active:scale-95 hover:bg-white/8 hover:border-white/20 focus:ring-white/20',
  },
  
  size: {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  },
};

// ============================================================================
// MODAL STYLES
// ============================================================================
export const modals = {
  wrapper: {
    className: [
      'relative',
      backgrounds.modal.className,
      radius.modal,
      borders.primary,
      'overflow-hidden w-full',
    ].join(' '),
    style: backgrounds.modal.style,
  },
  
  overlay: 'bg-black/50 backdrop-blur-sm',
  content: radius.modal,
};

// ============================================================================
// CARD STYLES
// ============================================================================
export const cards = {
  base: {
    className: [
      radius.card,
      'border overflow-hidden',
      'transition-all duration-500',
      'hover:scale-[1.02]',
      backgrounds.layer2,
      borders.tertiary,
      'shadow-2xl',
    ].join(' '),
  },
  
  hover: backgrounds.hover.layer1,
};

// ============================================================================
// SEARCH BAR STYLES
// ============================================================================
export const searchBar = {
  base: {
    className: [
      'w-full pl-10 pr-4 py-3',
      radius.searchBar,
      'border transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      backgrounds.layer2,
      borders.secondary,
      text.primary,
      'placeholder:text-white/60',
      borders.focus.secondary,
      backgrounds.hover.layer4,
      borders.hover.secondary,
    ].join(' '),
  },
  
  icon: {
    className: 'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 w-5 text-white z-10',
  },
};

// ============================================================================
// TEXTAREA STYLES
// ============================================================================
export const textarea = {
  base: {
    className: 'w-full p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[12px] text-white placeholder:text-white/60 placeholder:text-xs resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors duration-200',
  },
};

// ============================================================================
// TAG/BADGE STYLES
// ============================================================================
export const tags = {
  // Base tag styles
  base: {
    className: 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1',
  },
  
  // Size variants
  size: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  },
  
  // Radius variants
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    pill: 'rounded-2xl',
    full: 'rounded-full',
  },
  
  // Variant styles
  variants: {
    // Default display tag
    default: {
      className: 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1',
    },
    
    // Clickable tag (for filtering/searching)
    clickable: {
      className: 'px-2 py-1 text-xs bg-white/8 backdrop-blur-sm text-white/90 rounded-md border border-white/10 cursor-pointer hover:bg-white/15 transition-colors',
    },
    
    // Removable tag (with hover state for removal)
    removable: {
      className: 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1 hover:bg-white/20 transition-colors',
    },
    
    // Selected/Active tag
    selected: {
      className: 'px-3 py-1.5 text-sm bg-white/20 text-white border border-white/30 rounded-2xl transition-all duration-200',
    },
    
    // Unselected tag (for toggle states)
    unselected: {
      className: 'px-3 py-1.5 text-sm bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/8 hover:text-white transition-all duration-200',
    },
    
    // Tag with count badge (for category tags)
    withCount: {
      base: {
        className: 'px-3 py-1.5 text-sm rounded-2xl transition-all duration-200 flex items-center gap-2',
      },
      selected: {
        className: 'bg-white/20 text-white border border-white/30',
      },
      unselected: {
        className: 'bg-white/5 text-white border border-white/10 hover:bg-white/8 hover:text-white',
      },
      badge: {
        selected: {
          className: 'px-1.5 py-0.5 text-xs rounded-full bg-white/20 text-white',
        },
        unselected: {
          className: 'px-1.5 py-0.5 text-xs rounded-full bg-white/8 text-white/80',
        },
      },
    },
    
    // Tag in edit mode
    edit: {
      className: 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1',
    },
  },
  
  // Legacy aliases for backward compatibility
  removable: {
    className: 'px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-md flex items-center gap-1 hover:bg-white/20 transition-colors',
  },
  
  clickable: {
    className: 'px-2 py-1 text-xs bg-white/8 backdrop-blur-sm text-white/90 rounded-md border border-white/10 cursor-pointer hover:bg-white/15 transition-colors',
  },
};

// ============================================================================
// DROPDOWN/MENU STYLES
// ============================================================================
export const dropdowns = {
  base: {
    className: [
      'absolute top-full mt-2',
      backgrounds.modal.className,
      'border',
      radius['2xl'],
      'shadow-2xl z-50',
      'min-w-48 max-h-64 overflow-y-auto',
    ].join(' '),
    style: { backgroundColor: 'rgba(149, 153, 160, 0.95)' },
  },
  
  item: {
    className: [
      'w-full flex items-center gap-3 px-3 py-2',
      radius.md,
      'text-left transition-colors',
      text.primary,
      backgrounds.hover.layer3,
    ].join(' '),
  },
};

// ============================================================================
// UTILITY CLASSES
// ============================================================================
export const utilities = {
  // Transitions
  transition: {
    all: 'transition-all duration-300',
    colors: 'transition-colors duration-200',
    fast: 'transition-all duration-150',
  },
  
  // Shadows
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },
  
  // Backdrop blur
  blur: {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
  },
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

export const colors = {
  background: {
    primary: backgrounds.layer1,
    secondary: backgrounds.layer2,
    muted: backgrounds.layer3,
    overlay: backgrounds.overlay,
  },
  border: {
    primary: borders.secondary,
    secondary: borders.tertiary,
  },
  hover: {
    primary: backgrounds.hover.layer4,
    secondary: backgrounds.hover.layer5,
  },
  button: {
    base: 'h-10 rounded-lg px-4 py-2 text-base font-normal',
    primary: [
      backgrounds.selected.layer1,
      backgrounds.modal.className,
      text.primary,
      borders.secondary,
      backgrounds.hover.layer2,
    ].join(' '),
    secondary: [
      backgrounds.layer2,
      backgrounds.modal.className,
      text.primary,
      borders.tertiary,
      'shadow-sm',
      backgrounds.hover.layer4,
    ].join(' '),
    ghost: [text.primary, backgrounds.hover.layer5].join(' '),
    selected: [
      backgrounds.selected.layer1,
      backgrounds.modal.className,
      text.primary,
      borders.secondary,
      backgrounds.hover.layer2,
    ].join(' '),
    unselected: [
      backgrounds.layer2,
      backgrounds.modal.className,
      text.primary,
      borders.tertiary,
      'shadow-sm',
      backgrounds.hover.layer4,
    ].join(' '),
  },
  tag: {
    base: 'h-8 px-4 py-2 rounded-full text-base font-normal',
    selected: [
      backgrounds.selected.layer1,
      backgrounds.modal.className,
      text.primary,
      borders.secondary,
      backgrounds.hover.layer2,
    ].join(' '),
    unselected: [
      backgrounds.layer2,
      backgrounds.modal.className,
      text.primary,
      borders.tertiary,
      'shadow-sm',
      backgrounds.hover.layer4,
    ].join(' '),
  }
};

export const spacing = {
  container: 'p-6',
  stack: 'space-y-6',
  cluster: 'space-x-2',
  wrap: 'gap-2',
  inset: {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  },
  squish: {
    sm: 'px-2 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  },
  position: {
    sm: 'top-2 right-2',
    md: 'top-4 right-4',
    lg: 'top-6 right-6',
  }
};

export const layout = {
  modal: {
    base: [radius.modal, 'overflow-hidden'].join(' '),
    sizes: {
      default: 'max-w-4xl',
      full: 'max-w-[90vw] max-h-[90vh]',
      screen: 'w-screen h-screen',
    }
  },
  input: {
    base: [
      'h-10',
      radius.md,
      'px-4 py-2 text-base font-normal',
      backgrounds.layer2,
      text.primary,
      borders.tertiary,
      'focus:ring-1',
      borders.focus.secondary,
    ].join(' ')
  }
};
