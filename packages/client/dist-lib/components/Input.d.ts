import React from 'react';
export interface InputProps {
    /**
     * The input type
     */
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    /**
     * The input placeholder
     */
    placeholder?: string;
    /**
     * The input value
     */
    value?: string;
    /**
     * Whether the input is disabled
     */
    disabled?: boolean;
    /**
     * Whether the input is required
     */
    required?: boolean;
    /**
     * The input label
     */
    label?: string;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Help text to display
     */
    helpText?: string;
    /**
     * Change handler
     */
    onChange?: (value: string) => void;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Input: React.FC<InputProps>;
export default Input;
//# sourceMappingURL=Input.d.ts.map