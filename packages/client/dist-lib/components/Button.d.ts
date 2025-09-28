import React from 'react';
export interface ButtonProps {
    /**
     * The content to display inside the button
     */
    children: React.ReactNode;
    /**
     * The variant style of the button
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    /**
     * The size of the button
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether the button is disabled
     */
    disabled?: boolean;
    /**
     * The button type
     */
    type?: 'button' | 'submit' | 'reset';
    /**
     * Click handler
     */
    onClick?: () => void;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
//# sourceMappingURL=Button.d.ts.map