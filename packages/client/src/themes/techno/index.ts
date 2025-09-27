import { Theme } from '../types';

export const technoTheme: Theme = {
  name: 'techno',
  colors: {
    primary: {
      main: '#00E676', // softer matrix green - better contrast
      light: '#33F088',
      dark: '#00C853',
      contrast: '#000000',
    },
    secondary: {
      main: '#FF5722', // adjusted orange for better balance
      light: '#FF7043',
      dark: '#E64A19',
      contrast: '#FFFFFF',
    },
    background: {
      default: '#000000',
      paper: '#0D1117',
      elevated: '#161B22',
    },
    text: {
      primary: '#00E676', // softer green for better readability
      secondary: '#FF5722', // adjusted orange
      disabled: '#4A4A4A', // better contrast for disabled text
      inverse: '#000000',
    },
    border: {
      default: '#00E676',
      light: '#33F088',
      dark: '#00C853',
    },
    status: {
      success: '#00E676',
      warning: '#FF9800', // softer orange
      error: '#F44336', // softer red
      info: '#00BCD4', // softer cyan
    },
    interactive: {
      hover: '#0D1117',
      active: '#161B22',
      focus: '#00E67633',
      disabled: '#333333',
      hoverPrimary: '#00E67622',
      hoverSecondary: '#FF572222',
      hoverSuccess: '#00E67622',
      hoverWarning: '#FF980022',
      hoverError: '#F4433622',
      hoverInfo: '#00BCD422',
    },
  },
  effects: {
    shadow: {
      sm: '0 0 3px #00E676',
      md: '0 0 6px #00E676, 0 0 12px #00E67633',
      lg: '0 0 9px #00E676, 0 0 18px #00E67633, 0 0 27px #00E67622',
      xl: '0 0 12px #00E676, 0 0 24px #00E67633, 0 0 36px #00E67622, 0 0 48px #00E67611',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      full: '9999px',
    },
    transition: {
      fast: '100ms linear',
      normal: '200ms linear',
      slow: '300ms linear',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #00E676 0%, #00BCD4 100%)',
      secondary: 'linear-gradient(45deg, #FF5722 0%, #F44336 100%)',
      accent: 'linear-gradient(90deg, #00E676 0%, #FF5722 50%, #F44336 100%)',
      subtle: 'linear-gradient(135deg, #000000 0%, #0D1117 100%)',
      bold: 'linear-gradient(135deg, #00E676 0%, #FF5722 50%, #F44336 100%)',
      rainbow: 'linear-gradient(135deg, #00E676 0%, #00BCD4 25%, #FF5722 50%, #F44336 75%, #00E676 100%)',
      dark: 'linear-gradient(135deg, #000000 0%, #0D1117 100%)',
      light: 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
    },
    effects: {
      glow: '0 0 10px currentColor',
      neon: '0 0 5px currentColor, 0 0 10px currentColor',
      metallic: '0 0 8px rgba(0, 230, 118, 0.4)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.3), transparent)',
      pulse: '0 0 0 0 rgba(0, 230, 118, 0.6)',
      bounce: 'translateY(-3px)',
      slide: 'translateX(3px)',
      fade: 'opacity 0.1s linear',
      scale: 'scale(1.08)',
    },
    hover: {
      scale: 'scale(1.03)',
      rotate: 'rotate(0.5deg)',
      translate: 'translateY(-1px)',
      glow: '0 0 15px rgba(0, 230, 118, 0.5)',
      shadow: '0 0 20px rgba(0, 230, 118, 0.3)',
      background: 'rgba(0, 230, 118, 0.08)',
    },
  },
  typography: {
    fontFamily: {
      primary: 'Courier New, monospace',
      secondary: 'Consolas, monospace',
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
    matrix: 'matrix 0.5s ease-in-out infinite',
    scan: 'scan 2s linear infinite',
    blink: 'blink 1s step-end infinite',
    terminal: 'terminal 2s ease-in-out infinite',
    glitch: 'glitch 0.3s ease-in-out infinite',
    hack: 'hack 1s linear infinite',
    code: 'code 3s linear infinite',
  },
  keyframes: {
    matrix: '@keyframes matrix { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }',
    scan: '@keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }',
    blink: '@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }',
    terminal: '@keyframes terminal { 0%, 100% { background-color: #00E676; } 50% { background-color: #000000; } }',
    glitch: '@keyframes glitch { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-2px); } 40% { transform: translateX(2px); } 60% { transform: translateX(-1px); } 80% { transform: translateX(1px); } }',
    hack: '@keyframes hack { 0% { color: #00E676; } 50% { color: #FF5722; } 100% { color: #00E676; } }',
    code: '@keyframes code { 0% { text-shadow: 0 0 5px #00E676; } 50% { text-shadow: 0 0 20px #00E676, 0 0 30px #00E676; } 100% { text-shadow: 0 0 5px #00E676; } }',
  },
};
