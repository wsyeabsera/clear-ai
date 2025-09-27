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
      pattern: '#00D4FF',
      overlay: 'rgba(0, 212, 255, 0.05)',
      accent: '#FF00CC',
    },
    text: {
      primary: '#FFFFFF', // Much better contrast - white text
      secondary: '#00D4FF', // cyan for secondary
      disabled: '#666666', // better contrast for disabled text
      inverse: '#000000',
      accent: '#FF00CC',
      highlight: '#00FF66',
    },
    border: {
      default: '#00D4FF',
      light: '#33E0FF',
      dark: '#00B8E6',
      accent: '#FF00CC',
      glow: '#00D4FF',
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
    patterns: {
      dots: 'radial-gradient(circle, #00D4FF 1px, transparent 1px)',
      grid: 'linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)',
      lines: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #00D4FF 10px, #00D4FF 11px)',
      waves: 'radial-gradient(circle at 25% 25%, #00D4FF 2px, transparent 2px), radial-gradient(circle at 75% 75%, #00D4FF 2px, transparent 2px)',
      hexagons: 'linear-gradient(30deg, #00D4FF 12%, transparent 12.5%, transparent 87%, #00D4FF 87.5%, #00D4FF), linear-gradient(150deg, #00D4FF 12%, transparent 12.5%, transparent 87%, #00D4FF 87.5%, #00D4FF)',
      triangles: 'linear-gradient(45deg, #00D4FF 25%, transparent 25%), linear-gradient(-45deg, #00D4FF 25%, transparent 25%)',
      circles: 'radial-gradient(circle at 20% 50%, #00D4FF 1px, transparent 1px), radial-gradient(circle at 80% 50%, #00D4FF 1px, transparent 1px)',
      squares: 'linear-gradient(45deg, #00D4FF 25%, transparent 25%), linear-gradient(-45deg, #00D4FF 25%, transparent 25%)',
      custom: 'conic-gradient(from 0deg, #00D4FF 0deg, #FF00CC 60deg, #00FF66 120deg, #00D4FF 180deg, #FF00CC 240deg, #00FF66 300deg, #00D4FF 360deg)',
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
      hologram: 'linear-gradient(45deg, transparent 30%, rgba(0,212,255,0.1) 50%, transparent 70%)',
      matrix: 'linear-gradient(90deg, transparent 98%, #00D4FF 100%), linear-gradient(0deg, transparent 98%, #00D4FF 100%)',
      cyber: 'linear-gradient(45deg, #00D4FF 1px, transparent 1px), linear-gradient(-45deg, #00D4FF 1px, transparent 1px)',
      vintage: 'radial-gradient(circle at 20% 80%, #00D4FF 1px, transparent 1px), radial-gradient(circle at 80% 20%, #00D4FF 1px, transparent 1px)',
      cosmic: 'radial-gradient(ellipse at top, #00D4FF 1px, transparent 1px), radial-gradient(ellipse at bottom, #00D4FF 1px, transparent 1px)',
      quantum: 'conic-gradient(from 0deg, #00D4FF 0deg, transparent 60deg, #00D4FF 120deg, transparent 180deg, #00D4FF 240deg, transparent 300deg, #00D4FF 360deg)',
    },
    hover: {
      scale: 'scale(1.05)',
      rotate: 'rotate(2deg)',
      translate: 'translateY(-3px)',
      glow: '0 0 25px rgba(0, 212, 255, 0.6)',
      shadow: '0 0 30px rgba(0, 212, 255, 0.4)',
      background: 'rgba(0, 212, 255, 0.1)',
    },
    backgroundAnimations: {
      floating: 'floating 3s ease-in-out infinite',
      rotating: 'rotating 4s linear infinite',
      pulsing: 'pulsing 2s ease-in-out infinite',
      morphing: 'morphing 5s ease-in-out infinite',
      flowing: 'flowing 6s ease-in-out infinite',
      custom: 'cyber 3s linear infinite',
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
