import { Theme } from '../types';

export const oldschoolTheme: Theme = {
  name: 'oldschool',
  colors: {
    primary: {
      main: '#6B4423', // darker brown for better contrast
      light: '#8B4513',
      dark: '#4A2C17',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#B8860B', // darker goldenrod for better contrast
      light: '#DAA520',
      dark: '#9A7209',
      contrast: '#000000',
    },
    background: {
      default: '#F5F5DC', // beige
      paper: '#FAEBD7', // antique white
      elevated: '#FFFFFF',
      pattern: '#B8860B',
      overlay: 'rgba(184, 134, 11, 0.05)',
      accent: '#DAA520',
    },
    text: {
      primary: '#2D1810', // much darker brown for better contrast
      secondary: '#4A2C17', // darker secondary
      disabled: '#8B7355', // better contrast for disabled
      inverse: '#FFFFFF',
      accent: '#B8860B',
      highlight: '#DAA520',
    },
    border: {
      default: '#B8860B',
      light: '#DAA520',
      dark: '#9A7209',
      accent: '#DAA520',
      glow: '#B8860B',
    },
    status: {
      success: '#1B5E20', // darker forest green
      warning: '#E65100', // darker orange
      error: '#B71C1C', // darker crimson
      info: '#1A237E', // darker royal blue
    },
    interactive: {
      hover: '#FAEBD7',
      active: '#F5F5DC',
      focus: '#B8860B33',
      disabled: '#E0E0E0',
      hoverPrimary: '#B8860B22',
      hoverSecondary: '#DAA52022',
      hoverSuccess: '#1B5E2022',
      hoverWarning: '#E6510022',
      hoverError: '#B71C1C22',
      hoverInfo: '#1A237E22',
    },
  },
  effects: {
    shadow: {
      sm: '2px 2px 4px rgba(0, 0, 0, 0.1)',
      md: '4px 4px 8px rgba(0, 0, 0, 0.15)',
      lg: '6px 6px 12px rgba(0, 0, 0, 0.2)',
      xl: '8px 8px 16px rgba(0, 0, 0, 0.25)',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    transition: {
      fast: '150ms ease',
      normal: '250ms ease',
      slow: '350ms ease',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #6B4423 0%, #B8860B 100%)',
      secondary: 'linear-gradient(45deg, #B8860B 0%, #DAA520 100%)',
      accent: 'linear-gradient(90deg, #6B4423 0%, #B8860B 50%, #DAA520 100%)',
      subtle: 'linear-gradient(135deg, #F5F5DC 0%, #FAEBD7 100%)',
      bold: 'linear-gradient(135deg, #6B4423 0%, #B8860B 50%, #DAA520 100%)',
      rainbow: 'linear-gradient(135deg, #6B4423 0%, #B8860B 25%, #DAA520 50%, #1B5E20 75%, #B71C1C 100%)',
      dark: 'linear-gradient(135deg, #4A2C17 0%, #6B4423 100%)',
      light: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5DC 100%)',
    },
    effects: {
      metallic: '0 0 5px rgba(184, 134, 11, 0.3)',
      glow: '0 0 10px rgba(184, 134, 11, 0.4)',
      neon: '0 0 3px rgba(184, 134, 11, 0.6)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(184,134,11,0.2), transparent)',
      pulse: '0 0 0 0 rgba(184, 134, 11, 0.5)',
      bounce: 'translateY(-2px)',
      slide: 'translateX(2px)',
      fade: 'opacity 0.25s ease',
      scale: 'scale(1.02)',
    },
    hover: {
      scale: 'scale(1.01)',
      rotate: 'rotate(0.5deg)',
      translate: 'translateY(-1px)',
      glow: '0 0 8px rgba(184, 134, 11, 0.3)',
      shadow: '6px 6px 12px rgba(0, 0, 0, 0.25)',
      background: 'rgba(184, 134, 11, 0.05)',
    },
    patterns: {
      dots: 'radial-gradient(circle, #D97706 1px, transparent 1px)',
      grid: 'linear-gradient(#D97706 1px, transparent 1px), linear-gradient(90deg, #D97706 1px, transparent 1px)',
      lines: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #D97706 2px, #D97706 4px)',
      waves: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #D97706 2px, #D97706 4px)',
      hexagons: 'radial-gradient(circle at 50% 50%, #D97706 1px, transparent 1px)',
      triangles: 'conic-gradient(from 0deg at 50% 50%, #D97706 0deg, transparent 120deg)',
      circles: 'radial-gradient(circle, #D97706 1px, transparent 1px)',
      squares: 'linear-gradient(90deg, #D97706 1px, transparent 1px), linear-gradient(#D97706 1px, transparent 1px)',
    },
    backgroundAnimations: {
      floating: 'floating 6s ease-in-out infinite',
      rotating: 'rotating 8s linear infinite',
      pulsing: 'pulsing 2s ease-in-out infinite',
      morphing: 'morphing 10s ease-in-out infinite',
      flowing: 'flowing 12s linear infinite',
    },
  },
  typography: {
    fontFamily: {
      primary: 'Times New Roman, serif',
      secondary: 'Georgia, serif',
      mono: 'Courier New, monospace',
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
    fade: 'fade 0.3s ease-in-out',
    slide: 'slide 0.3s ease-out',
    bounce: 'bounce 0.5s ease-in-out',
    antique: 'antique 2s ease-in-out infinite',
    vintage: 'vintage 3s ease-in-out infinite',
    classic: 'classic 1.5s ease-in-out infinite',
    elegant: 'elegant 2.5s ease-in-out infinite',
  },
  keyframes: {
    fade: '@keyframes fade { from { opacity: 0; } to { opacity: 1; } }',
    slide: '@keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
    bounce: '@keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0,-30px,0); } 70% { transform: translate3d(0,-15px,0); } 90% { transform: translate3d(0,-4px,0); } }',
    antique: '@keyframes antique { 0%, 100% { box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15); } 50% { box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.2); } }',
    vintage: '@keyframes vintage { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(1deg) scale(1.02); } 100% { transform: rotate(0deg) scale(1); } }',
    classic: '@keyframes classic { 0%, 100% { color: #6B4423; } 50% { color: #B8860B; } }',
    elegant: '@keyframes elegant { 0% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); } 50% { text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15); } 100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); } }',
  },
};
