import { Theme } from '../types';

export const neowaveTheme: Theme = {
  name: 'neowave',
  colors: {
    primary: {
      main: '#00D4FF', // softer cyan - better contrast
      light: '#33E0FF',
      dark: '#00B8E6',
      contrast: '#000000',
    },
    secondary: {
      main: '#FF00CC', // adjusted magenta for better balance
      light: '#FF33D9',
      dark: '#E600B8',
      contrast: '#FFFFFF',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A1A',
      elevated: '#2A2A2A',
    },
    text: {
      primary: '#00D4FF', // softer cyan for better readability
      secondary: '#FF00CC', // adjusted magenta
      disabled: '#4A4A4A', // better contrast for disabled text
      inverse: '#000000',
    },
    border: {
      default: '#00D4FF',
      light: '#33E0FF',
      dark: '#00B8E6',
    },
    status: {
      success: '#00FF66', // softer green
      warning: '#FFB800', // softer yellow
      error: '#FF3366', // softer red
      info: '#00D4FF', // consistent with primary
    },
    interactive: {
      hover: '#1A1A1A',
      active: '#2A2A2A',
      focus: '#00D4FF33',
      disabled: '#333333',
      hoverPrimary: '#00D4FF22',
      hoverSecondary: '#FF00CC22',
      hoverSuccess: '#00FF6622',
      hoverWarning: '#FFB80022',
      hoverError: '#FF336622',
      hoverInfo: '#00D4FF22',
    },
  },
  effects: {
    shadow: {
      sm: '0 0 5px #00D4FF',
      md: '0 0 10px #00D4FF, 0 0 20px #00D4FF33',
      lg: '0 0 15px #00D4FF, 0 0 30px #00D4FF33, 0 0 45px #00D4FF22',
      xl: '0 0 20px #00D4FF, 0 0 40px #00D4FF33, 0 0 60px #00D4FF22, 0 0 80px #00D4FF11',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    transition: {
      fast: '100ms ease-out',
      normal: '200ms ease-out',
      slow: '400ms ease-out',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #00D4FF 0%, #FF00CC 100%)',
      secondary: 'linear-gradient(45deg, #00FF66 0%, #00D4FF 100%)',
      accent: 'linear-gradient(90deg, #FF00CC 0%, #FFB800 50%, #00D4FF 100%)',
      subtle: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      bold: 'linear-gradient(135deg, #00D4FF 0%, #FF00CC 50%, #FFB800 100%)',
      rainbow: 'linear-gradient(135deg, #FF3366 0%, #FF00CC 25%, #00D4FF 50%, #00FF66 75%, #FFB800 100%)',
      dark: 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
      light: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
    },
    effects: {
      glow: '0 0 20px currentColor',
      neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
      metallic: '0 0 10px rgba(0, 212, 255, 0.5)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
      pulse: '0 0 0 0 rgba(0, 212, 255, 0.7)',
      bounce: 'translateY(-6px)',
      slide: 'translateX(6px)',
      fade: 'opacity 0.2s ease-out',
      scale: 'scale(1.1)',
    },
    hover: {
      scale: 'scale(1.05)',
      rotate: 'rotate(2deg)',
      translate: 'translateY(-3px)',
      glow: '0 0 25px rgba(0, 212, 255, 0.6)',
      shadow: '0 0 30px rgba(0, 212, 255, 0.4)',
      background: 'rgba(0, 212, 255, 0.1)',
    },
  },
  typography: {
    fontFamily: {
      primary: 'Orbitron, monospace',
      secondary: 'Exo 2, sans-serif',
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
    glow: 'glow 2s ease-in-out infinite alternate',
    pulse: 'pulse 1s ease-in-out infinite',
    slide: 'slide 0.3s ease-out',
    neon: 'neon 1.5s ease-in-out infinite alternate',
    cyber: 'cyber 3s linear infinite',
    matrix: 'matrix 4s linear infinite',
    flicker: 'flicker 0.15s infinite linear',
  },
  keyframes: {
    glow: '@keyframes glow { from { text-shadow: 0 0 5px currentColor; } to { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; } }',
    pulse: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }',
    slide: '@keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
    neon: '@keyframes neon { 0%, 100% { box-shadow: 0 0 5px #00D4FF, 0 0 10px #00D4FF, 0 0 15px #00D4FF; } 50% { box-shadow: 0 0 2px #00D4FF, 0 0 5px #00D4FF, 0 0 8px #00D4FF; } }',
    cyber: '@keyframes cyber { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }',
    matrix: '@keyframes matrix { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }',
    flicker: '@keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }',
  },
};
