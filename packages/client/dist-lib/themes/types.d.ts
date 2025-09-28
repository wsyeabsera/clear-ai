export interface ThemeColors {
    primary: {
        main: string;
        light: string;
        dark: string;
        contrast: string;
    };
    secondary: {
        main: string;
        light: string;
        dark: string;
        contrast: string;
    };
    background: {
        default: string;
        paper: string;
        elevated: string;
        pattern?: string;
        overlay?: string;
        accent?: string;
    };
    text: {
        primary: string;
        secondary: string;
        disabled: string;
        inverse: string;
        accent?: string;
        highlight?: string;
    };
    border: {
        default: string;
        light: string;
        dark: string;
        accent?: string;
        glow?: string;
    };
    status: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    interactive: {
        hover: string;
        active: string;
        focus: string;
        disabled: string;
        hoverPrimary?: string;
        hoverSecondary?: string;
        hoverSuccess?: string;
        hoverWarning?: string;
        hoverError?: string;
        hoverInfo?: string;
    };
}
export interface ThemeEffects {
    shadow: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
    transition: {
        fast: string;
        normal: string;
        slow: string;
    };
    gradient: {
        primary: string;
        secondary: string;
        accent: string;
        subtle?: string;
        bold?: string;
        rainbow?: string;
        dark?: string;
        light?: string;
    };
    patterns: {
        dots?: string;
        grid?: string;
        lines?: string;
        waves?: string;
        hexagons?: string;
        triangles?: string;
        circles?: string;
        squares?: string;
        custom?: string;
    };
    effects: {
        glow?: string;
        neon?: string;
        metallic?: string;
        shimmer?: string;
        pulse?: string;
        bounce?: string;
        slide?: string;
        fade?: string;
        scale?: string;
        hologram?: string;
        matrix?: string;
        cyber?: string;
        vintage?: string;
        cosmic?: string;
        quantum?: string;
    };
    hover: {
        scale?: string;
        rotate?: string;
        translate?: string;
        glow?: string;
        shadow?: string;
        background?: string;
    };
    backgroundAnimations: {
        floating?: string;
        rotating?: string;
        pulsing?: string;
        morphing?: string;
        flowing?: string;
        custom?: string;
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
    keyframes?: {
        [key: string]: string;
    };
}
export type ThemeName = 'default' | 'neowave' | 'techno' | 'oldschool' | 'alien';
export { themes } from './configs';
//# sourceMappingURL=types.d.ts.map