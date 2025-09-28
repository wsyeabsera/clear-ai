import React from 'react';
export interface TextAreaProps {
    /**
     * The label for the textarea
     */
    label?: string;
    /**
     * The value of the textarea
     */
    value: string;
    /**
     * The change handler
     */
    onChange: (value: string) => void;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Number of rows
     */
    rows?: number;
    /**
     * Whether the field is required
     */
    required?: boolean;
    /**
     * Error message
     */
    error?: string;
    /**
     * Whether the textarea is disabled
     */
    disabled?: boolean;
    /**
     * Whether the textarea is read-only
     */
    readOnly?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Minimum number of rows
     */
    minRows?: number;
    /**
     * Maximum number of rows
     */
    maxRows?: number;
}
declare const TextArea: React.FC<TextAreaProps>;
export default TextArea;
//# sourceMappingURL=TextArea.d.ts.map