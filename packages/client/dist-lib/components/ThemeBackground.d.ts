import React from 'react';
export interface ThemeBackgroundProps {
    /**
     * Pattern type to apply
     */
    pattern?: 'dots' | 'grid' | 'lines' | 'waves' | 'hexagons' | 'triangles' | 'circles' | 'squares' | 'custom';
    /**
     * Effect type to apply
     */
    effect?: 'hologram' | 'matrix' | 'cyber' | 'vintage' | 'cosmic' | 'quantum';
    /**
     * Background animation type
     */
    animation?: 'floating' | 'rotating' | 'pulsing' | 'morphing' | 'flowing' | 'custom';
    /**
     * Opacity of the pattern/effect
     */
    opacity?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Children to render
     */
    children?: React.ReactNode;
    /**
     * Whether to apply the background to the entire viewport
     */
    fullscreen?: boolean;
}
declare const ThemeBackground: React.FC<ThemeBackgroundProps>;
export default ThemeBackground;
//# sourceMappingURL=ThemeBackground.d.ts.map