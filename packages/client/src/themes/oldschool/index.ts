import { Theme } from '../types';

export const oldschoolTheme: Theme = {
  name: 'oldschool',
  colors: {
    primary: {
      main: '#8B4513', // saddle brown
      light: '#A0522D',
      dark: '#654321',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#DAA520', // goldenrod
      light: '#FFD700',
      dark: '#B8860B',
      contrast: '#000000',
    },
    background: {
      default: '#F5F5DC', // beige
      paper: '#FAEBD7', // antique white
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#8B4513',
      secondary: '#654321',
      disabled: '#A0A0A0',
      inverse: '#FFFFFF',
    },
    border: {
      default: '#DAA520',
      light: '#FFD700',
      dark: '#B8860B',
    },
    status: {
      success: '#228B22', // forest green
      warning: '#FF8C00', // dark orange
      error: '#DC143C', // crimson
      info: '#4169E1', // royal blue
    },
    interactive: {
      hover: '#FAEBD7',
      active: '#F5F5DC',
      focus: '#DAA52033',
      disabled: '#E0E0E0',
      hoverPrimary: '#DAA52022',
      hoverSecondary: '#FFD70022',
      hoverSuccess: '#228B2222',
      hoverWarning: '#FF8C0022',
      hoverError: '#DC143C22',
      hoverInfo: '#4169E122',
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
      primary: 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)',
      secondary: 'linear-gradient(45deg, #DAA520 0%, #FFD700 100%)',
      accent: 'linear-gradient(90deg, #8B4513 0%, #DAA520 50%, #FFD700 100%)',
      subtle: 'linear-gradient(135deg, #F5F5DC 0%, #FAEBD7 100%)',
      bold: 'linear-gradient(135deg, #8B4513 0%, #DAA520 50%, #FFD700 100%)',
      rainbow: 'linear-gradient(135deg, #8B4513 0%, #DAA520 25%, #FFD700 50%, #228B22 75%, #DC143C 100%)',
      dark: 'linear-gradient(135deg, #654321 0%, #8B4513 100%)',
      light: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5DC 100%)',
    },
    effects: {
      metallic: '0 0 5px rgba(218, 165, 32, 0.3)',
      glow: '0 0 10px rgba(218, 165, 32, 0.4)',
      neon: '0 0 3px rgba(218, 165, 32, 0.6)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(218,165,32,0.2), transparent)',
      pulse: '0 0 0 0 rgba(218, 165, 32, 0.5)',
      bounce: 'translateY(-2px)',
      slide: 'translateX(2px)',
      fade: 'opacity 0.25s ease',
      scale: 'scale(1.02)',
    },
    hover: {
      scale: 'scale(1.01)',
      rotate: 'rotate(0.5deg)',
      translate: 'translateY(-1px)',
      glow: '0 0 8px rgba(218, 165, 32, 0.3)',
      shadow: '6px 6px 12px rgba(0, 0, 0, 0.25)',
      background: 'rgba(218, 165, 32, 0.05)',
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
    classic: '@keyframes classic { 0%, 100% { color: #8B4513; } 50% { color: #DAA520; } }',
    elegant: '@keyframes elegant { 0% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); } 50% { text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15); } 100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); } }',
  },
};
