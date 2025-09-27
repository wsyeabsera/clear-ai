import { Theme } from '../types';

export const alienTheme: Theme = {
  name: 'alien',
  colors: {
    primary: {
      main: '#00FF88', // softer alien green - better contrast
      light: '#33FF99',
      dark: '#00CC6A',
      contrast: '#000000',
    },
    secondary: {
      main: '#FF0080', // adjusted pink for better balance
      light: '#FF33A3',
      dark: '#CC0066',
      contrast: '#FFFFFF',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A2E',
      elevated: '#16213E',
      pattern: '#00FF88',
      overlay: 'rgba(0, 255, 136, 0.05)',
      accent: '#FF0080',
    },
    text: {
      primary: '#FFFFFF', // Much better contrast - white text
      secondary: '#00FF88', // green for secondary
      disabled: '#666666', // better contrast for disabled text
      inverse: '#000000',
      accent: '#FF0080',
      highlight: '#00CCFF',
    },
    border: {
      default: '#00FF88',
      light: '#33FF99',
      dark: '#00CC6A',
      accent: '#FF0080',
      glow: '#00FF88',
    },
    status: {
      success: '#00FF88',
      warning: '#FFB800', // softer yellow
      error: '#FF3366', // softer red
      info: '#00CCFF', // softer cyan
    },
    interactive: {
      hover: '#1A1A2E',
      active: '#16213E',
      focus: '#00FF8833',
      disabled: '#333333',
      hoverPrimary: '#00FF8822',
      hoverSecondary: '#FF008022',
      hoverSuccess: '#00FF8822',
      hoverWarning: '#FFB80022',
      hoverError: '#FF336622',
      hoverInfo: '#00CCFF22',
    },
  },
  effects: {
    shadow: {
      sm: '0 0 5px #00FF88',
      md: '0 0 10px #00FF88, 0 0 20px #00FF8833',
      lg: '0 0 15px #00FF88, 0 0 30px #00FF8833, 0 0 45px #00FF8822',
      xl: '0 0 20px #00FF88, 0 0 40px #00FF8833, 0 0 60px #00FF8822, 0 0 80px #00FF8811',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.75rem',
      lg: '1.25rem',
      full: '9999px',
    },
    transition: {
      fast: '100ms ease-out',
      normal: '200ms ease-out',
      slow: '400ms ease-out',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #00FF88 0%, #FF0080 100%)',
      secondary: 'linear-gradient(45deg, #00CCFF 0%, #00FF88 100%)',
      accent: 'linear-gradient(90deg, #00FF88 0%, #FF0080 50%, #00CCFF 100%)',
      subtle: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)',
      bold: 'linear-gradient(135deg, #00FF88 0%, #FF0080 50%, #00CCFF 100%)',
      rainbow: 'linear-gradient(135deg, #00FF88 0%, #FF0080 20%, #00CCFF 40%, #FFB800 60%, #FF3366 80%, #00FF88 100%)',
      dark: 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
      light: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    },
    effects: {
      glow: '0 0 15px currentColor',
      neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
      metallic: '0 0 12px rgba(0, 255, 136, 0.6)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)',
      pulse: '0 0 0 0 rgba(0, 255, 136, 0.8)',
      bounce: 'translateY(-8px)',
      slide: 'translateX(8px)',
      fade: 'opacity 0.2s ease-out',
      scale: 'scale(1.12)',
    },
    hover: {
      scale: 'scale(1.06)',
      rotate: 'rotate(3deg)',
      translate: 'translateY(-4px)',
      glow: '0 0 30px rgba(0, 255, 136, 0.7)',
      shadow: '0 0 40px rgba(0, 255, 136, 0.5)',
      background: 'rgba(0, 255, 136, 0.12)',
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
    alien: 'alien 2s ease-in-out infinite alternate',
    morph: 'morph 3s ease-in-out infinite',
    pulse: 'pulse 1s ease-in-out infinite',
    cosmic: 'cosmic 4s linear infinite',
    energy: 'energy 1.5s ease-in-out infinite',
    portal: 'portal 2s ease-in-out infinite',
    quantum: 'quantum 3s ease-in-out infinite',
  },
  keyframes: {
    alien: '@keyframes alien { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-10px) rotate(5deg); } }',
    morph: '@keyframes morph { 0% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.1) rotate(90deg); } 50% { transform: scale(0.9) rotate(180deg); } 75% { transform: scale(1.05) rotate(270deg); } 100% { transform: scale(1) rotate(360deg); } }',
    pulse: '@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }',
    cosmic: '@keyframes cosmic { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }',
    energy: '@keyframes energy { 0%, 100% { box-shadow: 0 0 20px #00FF88, 0 0 30px #00FF88; } 50% { box-shadow: 0 0 40px #00FF88, 0 0 60px #00FF88, 0 0 80px #00FF88; } }',
    portal: '@keyframes portal { 0% { transform: scale(1) rotate(0deg); border-radius: 50%; } 50% { transform: scale(1.2) rotate(180deg); border-radius: 0%; } 100% { transform: scale(1) rotate(360deg); border-radius: 50%; } }',
    quantum: '@keyframes quantum { 0% { color: #00FF88; text-shadow: 0 0 10px #00FF88; } 25% { color: #FF0080; text-shadow: 0 0 10px #FF0080; } 50% { color: #00CCFF; text-shadow: 0 0 10px #00CCFF; } 75% { color: #FFB800; text-shadow: 0 0 10px #FFB800; } 100% { color: #00FF88; text-shadow: 0 0 10px #00FF88; } }',
  },
};
