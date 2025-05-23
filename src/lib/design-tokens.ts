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
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
  }
};

export const colors = {
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    muted: 'bg-gray-100',
    overlay: 'bg-white/95',
  },
  border: {
    primary: 'border-gray-200',
    secondary: 'border-gray-100',
  },
  hover: {
    primary: 'hover:bg-gray-50',
    secondary: 'hover:bg-gray-100',
  },
  button: {
    base: 'h-10 rounded-lg px-4 py-2 text-base font-normal',
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200',
    ghost: 'text-gray-900 hover:bg-gray-50',
    selected: 'bg-gray-900 text-white hover:bg-gray-800',
    unselected: 'bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200',
  },
  tag: {
    base: 'h-8 px-4 py-2 rounded-full text-base font-normal',
    selected: 'bg-gray-900 text-white hover:bg-gray-800',
    unselected: 'bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200',
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
    base: 'h-10 rounded-lg px-4 py-2 text-base font-normal bg-white text-gray-900 border border-gray-200 focus:ring-1 focus:ring-gray-900'
  }
};