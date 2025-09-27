import { Theme } from '../types';

export const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: {
      main: '#3B82F6', // blue-500
      light: '#60A5FA', // blue-400
      dark: '#2563EB', // blue-600
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280', // gray-500
      light: '#9CA3AF', // gray-400
      dark: '#4B5563', // gray-600
      contrast: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB', // gray-50
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      disabled: '#9CA3AF', // gray-400
      inverse: '#FFFFFF',
    },
    border: {
      default: '#D1D5DB', // gray-300
      light: '#E5E7EB', // gray-200
      dark: '#9CA3AF', // gray-400
    },
    status: {
      success: '#10B981', // emerald-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // red-500
      info: '#3B82F6', // blue-500
    },
    interactive: {
      hover: '#F3F4F6', // gray-100
      active: '#E5E7EB', // gray-200
      focus: '#DBEAFE', // blue-100
      disabled: '#F9FAFB', // gray-50
      hoverPrimary: '#EBF8FF', // blue-50
      hoverSecondary: '#F9FAFB', // gray-50
      hoverSuccess: '#ECFDF5', // green-50
      hoverWarning: '#FFFBEB', // amber-50
      hoverError: '#FEF2F2', // red-50
      hoverInfo: '#EBF8FF', // blue-50
    },
  },
  effects: {
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    },
    transition: {
      fast: '150ms ease-in-out',
      normal: '200ms ease-in-out',
      slow: '300ms ease-in-out',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      secondary: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
      accent: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
      subtle: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      bold: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 50%, #DC2626 100%)',
      rainbow: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 25%, #10B981 50%, #3B82F6 75%, #8B5CF6 100%)',
      dark: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      light: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    },
    effects: {
      glow: '0 0 20px rgba(59, 130, 246, 0.5)',
      neon: '0 0 5px currentColor, 0 0 10px currentColor',
      metallic: '0 0 10px rgba(156, 163, 175, 0.3)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      pulse: '0 0 0 0 rgba(59, 130, 246, 0.7)',
      bounce: 'translateY(-4px)',
      slide: 'translateX(4px)',
      fade: 'opacity 0.3s ease-in-out',
      scale: 'scale(1.05)',
    },
    hover: {
      scale: 'scale(1.02)',
      rotate: 'rotate(1deg)',
      translate: 'translateY(-2px)',
      glow: '0 0 15px rgba(59, 130, 246, 0.4)',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      background: 'rgba(59, 130, 246, 0.05)',
    },
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  animations: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
    slideIn: 'slideIn 0.3s ease-out',
    bounceIn: 'bounceIn 0.5s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    shimmer: 'shimmer 2s linear infinite',
    float: 'float 3s ease-in-out infinite',
  },
  keyframes: {
    fadeIn: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    slideIn: '@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
    bounceIn: '@keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }',
    pulse: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }',
    shimmer: '@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }',
    float: '@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }',
  },
};
