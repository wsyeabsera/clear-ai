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
      pattern: '#00E676',
      overlay: 'rgba(0, 230, 118, 0.05)',
      accent: '#FF5722',
    },
    text: {
      primary: '#FFFFFF', // Much better contrast - white text
      secondary: '#00E676', // green for secondary
      disabled: '#666666', // better contrast for disabled text
      inverse: '#000000',
      accent: '#FF5722',
      highlight: '#00BCD4',
    },
    border: {
      default: '#00E676',
      light: '#33F088',
      dark: '#00C853',
      accent: '#FF5722',
      glow: '#00E676',
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
    patterns: {
      dots: 'radial-gradient(circle, #00E676 1px, transparent 1px)',
      grid: 'linear-gradient(#00E676 1px, transparent 1px), linear-gradient(90deg, #00E676 1px, transparent 1px)',
      lines: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #00E676 10px, #00E676 11px)',
      waves: 'radial-gradient(circle at 25% 25%, #00E676 2px, transparent 2px), radial-gradient(circle at 75% 75%, #00E676 2px, transparent 2px)',
      hexagons: 'linear-gradient(30deg, #00E676 12%, transparent 12.5%, transparent 87%, #00E676 87.5%, #00E676), linear-gradient(150deg, #00E676 12%, transparent 12.5%, transparent 87%, #00E676 87.5%, #00E676)',
      triangles: 'linear-gradient(45deg, #00E676 25%, transparent 25%), linear-gradient(-45deg, #00E676 25%, transparent 25%)',
      circles: 'radial-gradient(circle at 20% 50%, #00E676 1px, transparent 1px), radial-gradient(circle at 80% 50%, #00E676 1px, transparent 1px)',
      squares: 'linear-gradient(45deg, #00E676 25%, transparent 25%), linear-gradient(-45deg, #00E676 25%, transparent 25%)',
      custom: 'conic-gradient(from 0deg, #00E676 0deg, #FF5722 60deg, #00BCD4 120deg, #00E676 180deg, #FF5722 240deg, #00BCD4 300deg, #00E676 360deg)',
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
      hologram: 'linear-gradient(45deg, transparent 30%, rgba(0,230,118,0.1) 50%, transparent 70%)',
      matrix: 'linear-gradient(90deg, transparent 98%, #00E676 100%), linear-gradient(0deg, transparent 98%, #00E676 100%)',
      cyber: 'linear-gradient(45deg, #00E676 1px, transparent 1px), linear-gradient(-45deg, #00E676 1px, transparent 1px)',
      vintage: 'radial-gradient(circle at 20% 80%, #00E676 1px, transparent 1px), radial-gradient(circle at 80% 20%, #00E676 1px, transparent 1px)',
      cosmic: 'radial-gradient(ellipse at top, #00E676 1px, transparent 1px), radial-gradient(ellipse at bottom, #00E676 1px, transparent 1px)',
      quantum: 'conic-gradient(from 0deg, #00E676 0deg, transparent 60deg, #00E676 120deg, transparent 180deg, #00E676 240deg, transparent 300deg, #00E676 360deg)',
    },
    hover: {
      scale: 'scale(1.03)',
      rotate: 'rotate(0.5deg)',
      translate: 'translateY(-1px)',
      glow: '0 0 15px rgba(0, 230, 118, 0.5)',
      shadow: '0 0 20px rgba(0, 230, 118, 0.3)',
      background: 'rgba(0, 230, 118, 0.08)',
    },
    backgroundAnimations: {
      floating: 'floating 3s ease-in-out infinite',
      rotating: 'rotating 4s linear infinite',
      pulsing: 'pulsing 2s ease-in-out infinite',
      morphing: 'morphing 5s ease-in-out infinite',
      flowing: 'flowing 6s ease-in-out infinite',
      custom: 'matrix 0.5s ease-in-out infinite',
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
