export const typography = {
  scale: {
    h1: 'text-base font-semibold leading-relaxed',
    h2: 'text-base font-semibold leading-relaxed',
    h3: 'text-base font-semibold leading-relaxed',
    body: 'text-base leading-relaxed',
    small: 'text-base leading-relaxed',
    caption: 'text-base leading-relaxed',
  },
  colors: {
    primary: 'text-white',
    secondary: 'text-white/80',
    muted: 'text-white/60',
  }
};

export const colors = {
  background: {
    primary: 'bg-white/10 backdrop-blur-sm',
    secondary: 'bg-white/5 backdrop-blur-sm',
    muted: 'bg-white/3 backdrop-blur-sm',
    overlay: 'bg-white/95',
  },
  border: {
    primary: 'border-white/20',
    secondary: 'border-white/10',
  },
  hover: {
    primary: 'hover:bg-white/8',
    secondary: 'hover:bg-white/5',
  },
  button: {
    base: 'h-10 rounded-lg px-4 py-2 text-base font-normal',
    primary: 'bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm text-white border border-white/10 shadow-sm hover:bg-white/8',
    ghost: 'text-white hover:bg-white/5',
    selected: 'bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20',
    unselected: 'bg-white/5 backdrop-blur-sm text-white border border-white/10 shadow-sm hover:bg-white/8',
  },
  tag: {
    base: 'h-8 px-4 py-2 rounded-full text-base font-normal',
    selected: 'bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20',
    unselected: 'bg-white/5 backdrop-blur-sm text-white border border-white/10 shadow-sm hover:bg-white/8',
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
    base: 'rounded-[32px] overflow-hidden',
    sizes: {
      default: 'max-w-4xl',
      full: 'max-w-[90vw] max-h-[90vh]',
      screen: 'w-screen h-screen',
    }
  },
  input: {
    base: 'h-10 rounded-lg px-4 py-2 text-base font-normal bg-white/5 backdrop-blur-sm text-white border border-white/10 focus:ring-1 focus:ring-white/20'
  }
};