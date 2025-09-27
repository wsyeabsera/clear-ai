import React from 'react';
import { useTheme } from '../themes';

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
  options: Array<{ value: string; label: string }>;
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

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
  className = '',
}) => {
  const { theme } = useTheme();

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.paper,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    outline: 'none',
    fontSize: '0.875rem',
    transition: theme.effects.transition.normal,
    cursor: disabled ? 'not-allowed' : 'pointer',
    // Ensure better contrast
    textShadow: 'none',
    fontWeight: '400',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
  };

  const placeholderStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.secondary,
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    if (!disabled) {
      e.target.style.borderColor = theme.colors.primary.main;
      e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.focus}`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border.default;
    e.target.style.boxShadow = 'none';
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={selectStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <option 
          value=""
          style={placeholderStyle}
        >
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            style={optionStyle}
          >
            {option.label}
          </option>
        ))}
      </select>
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

export default Select;
