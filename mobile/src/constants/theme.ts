/**
 * UniVault Design System — Color Palette
 *
 * Inspired by Apple, Pinterest, and Notion aesthetics.
 * Soft rose pink primary with clean whites and calm grays.
 */

export const colors = {
  // Primary
  primary: {
    50: '#FFF0F6',
    100: '#FBCFE8',
    200: '#F9A8D4',
    300: '#F472B6',
    400: '#EC4899',
    500: '#DB2777',
    600: '#BE185D',
    DEFAULT: '#F472B6',
    dark: '#EC4899',
  },

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#FFF7FA',
    tertiary: '#FFF0F6',
  },

  // Cards & Surfaces
  surface: {
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#EC4899',
  },

  // Borders
  border: {
    light: '#F3F4F6',
    default: '#E5E7EB',
    dark: '#D1D5DB',
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Collection preset colors
  collection: [
    '#F472B6', // Rose Pink
    '#FB923C', // Orange
    '#FBBF24', // Amber
    '#34D399', // Emerald
    '#60A5FA', // Blue
    '#A78BFA', // Purple
    '#F87171', // Red
    '#2DD4BF', // Teal
    '#818CF8', // Indigo
    '#FB7185', // Rose
    '#38BDF8', // Sky
    '#C084FC', // Violet
  ],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  families: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
