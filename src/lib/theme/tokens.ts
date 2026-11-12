// Design tokens for the marketplace UI
// Extend existing theme utilities with a coherent visual language

export const colors = {
  // Brand accent
  primary: '#0D6EFD', // a vibrant blue
  secondary: '#6C757D', // neutral gray
  // Semantic palette
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  // Neutral surfaces
  surface: '#FFFFFF',
  background: '#F6F8FB',
  muted: '#F8F9FA',
  // Text
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textInverse: '#FFFFFF',
};

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  // Scale – base 1rem = 16px
  size: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  lineHeight: {
    normal: '1.5',
    relaxed: '1.75',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  // spacing scale (rem)
  0: '0rem',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
};

export const radius = {
  none: '0px',
  sm: '0.125rem', // 2px
  md: '0.25rem', // 4px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px',
};

export const shadows = {
  subtle: '0 1px 3px rgba(0,0,0,0.08)',
  medium: '0 4px 12px rgba(0,0,0,0.12)',
  strong: '0 8px 24px rgba(0,0,0,0.2)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

