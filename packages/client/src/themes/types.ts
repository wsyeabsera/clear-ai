export interface ThemeColors {
  // Primary colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Secondary colors
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Background colors
  background: {
    default: string;
    paper: string;
    elevated: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  
  // Border colors
  border: {
    default: string;
    light: string;
    dark: string;
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Interactive states
  interactive: {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
    // Enhanced hover states
    hoverPrimary?: string;
    hoverSecondary?: string;
    hoverSuccess?: string;
    hoverWarning?: string;
    hoverError?: string;
    hoverInfo?: string;
  };
}

export interface ThemeEffects {
  // Shadows
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Border radius
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  
  // Transitions
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };
  
  // Gradients
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
    // Additional gradients
    subtle?: string;
    bold?: string;
    rainbow?: string;
    dark?: string;
    light?: string;
  };
  
  // Special effects
  effects: {
    glow?: string;
    neon?: string;
    metallic?: string;
    // Additional effects
    shimmer?: string;
    pulse?: string;
    bounce?: string;
    slide?: string;
    fade?: string;
    scale?: string;
  };
  
  // Hover effects
  hover: {
    scale?: string;
    rotate?: string;
    translate?: string;
    glow?: string;
    shadow?: string;
    background?: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  typography: ThemeTypography;
  animations: {
    [key: string]: string;
  };
  // Enhanced animation properties
  keyframes?: {
    [key: string]: string;
  };
}

export type ThemeName = 'default' | 'neowave' | 'techno' | 'oldschool' | 'alien';

// Export themes from configs
export { themes } from './configs';
