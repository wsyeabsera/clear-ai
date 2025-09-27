import { Theme } from '../types';

export const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: {
      main: '#2563EB', // blue-600 - better contrast
      light: '#3B82F6', // blue-500
      dark: '#1D4ED8', // blue-700
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED', // violet-600 - more vibrant
      light: '#8B5CF6', // violet-500
      dark: '#6D28D9', // violet-700
      contrast: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC', // slate-50 - slightly cooler
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // slate-900 - better contrast
      secondary: '#475569', // slate-600 - improved contrast
      disabled: '#94A3B8', // slate-400 - better contrast
      inverse: '#FFFFFF',
    },
    border: {
      default: '#CBD5E1', // slate-300 - better contrast
      light: '#E2E8F0', // slate-200
      dark: '#94A3B8', // slate-400
    },
    status: {
      success: '#059669', // emerald-600 - better contrast
      warning: '#D97706', // amber-600 - better contrast
      error: '#DC2626', // red-600 - better contrast
      info: '#2563EB', // blue-600 - consistent with primary
    },
    interactive: {
      hover: '#F1F5F9', // slate-100 - better contrast
      active: '#E2E8F0', // slate-200
      focus: '#DBEAFE', // blue-100
      disabled: '#F8FAFC', // slate-50
      hoverPrimary: '#EBF8FF', // blue-50
      hoverSecondary: '#F3E8FF', // violet-50
      hoverSuccess: '#ECFDF5', // emerald-50
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
      primary: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      secondary: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
      accent: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)',
      subtle: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      bold: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 50%, #DC2626 100%)',
      rainbow: 'linear-gradient(135deg, #DC2626 0%, #D97706 25%, #059669 50%, #2563EB 75%, #7C3AED 100%)',
      dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      light: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    },
    effects: {
      glow: '0 0 20px rgba(37, 99, 235, 0.5)',
      neon: '0 0 5px currentColor, 0 0 10px currentColor',
      metallic: '0 0 10px rgba(148, 163, 184, 0.3)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      pulse: '0 0 0 0 rgba(37, 99, 235, 0.7)',
      bounce: 'translateY(-4px)',
      slide: 'translateX(4px)',
      fade: 'opacity 0.3s ease-in-out',
      scale: 'scale(1.05)',
    },
    hover: {
      scale: 'scale(1.02)',
      rotate: 'rotate(1deg)',
      translate: 'translateY(-2px)',
      glow: '0 0 15px rgba(37, 99, 235, 0.4)',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      background: 'rgba(37, 99, 235, 0.05)',
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
