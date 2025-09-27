import React from 'react';
import { useTheme } from '../themes';

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

const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  error,
  disabled = false,
  readOnly = false,
  className = '',
  minRows = 3,
  maxRows = 10,
}) => {
  const { theme } = useTheme();

  const textAreaStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.paper,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    outline: 'none',
    fontSize: '0.875rem',
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: '1.5',
    resize: 'vertical',
    minHeight: `${minRows * 1.5}rem`,
    maxHeight: `${maxRows * 1.5}rem`,
    transition: theme.effects.transition.normal,
    cursor: disabled ? 'not-allowed' : 'text',
    // Ensure better contrast
    textShadow: 'none',
    fontWeight: '400',
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!disabled && !readOnly) {
      e.target.style.borderColor = theme.colors.primary.main;
      e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.focus}`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border.default;
    e.target.style.boxShadow = 'none';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disabled && !readOnly) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          className="block text-sm font-medium mb-1"
          style={{ color: theme.colors.text.primary }}
        >
          {label} {required && <span style={{ color: theme.colors.status.error }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        style={textAreaStyle}
      />
      {error && (
        <p 
          className="mt-1 text-sm"
          style={{ color: theme.colors.status.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
