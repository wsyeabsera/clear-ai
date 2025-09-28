import React from 'react';
export interface SelectProps {
    /**
     * The label for the select
     */
    label?: string;
    /**
     * The value of the select
     */
    value: string;
    /**
     * The change handler
     */
    onChange: (value: string) => void;
    /**
     * The options for the select
     */
    options: Array<{
        value: string;
        label: string;
    }>;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Whether the field is required
     */
    required?: boolean;
    /**
     * Error message
     */
    error?: string;
    /**
     * Whether the select is disabled
     */
    disabled?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Select: React.FC<SelectProps>;
export default Select;
//# sourceMappingURL=Select.d.ts.map