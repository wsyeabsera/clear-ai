import React from 'react';
import { useTheme } from '../themes';

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

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  disabled = false,
  required = false,
  label,
  error,
  helpText,
  onChange,
  className = '',
}) => {
  const { theme } = useTheme();
  
  const inputStyles = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    boxShadow: theme.effects.shadow.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.default,
    transition: theme.effects.transition.normal,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    '&:focus': {
      borderColor: error ? theme.colors.status.error : theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${error ? theme.colors.status.error : theme.colors.primary.main}33`,
    },
    '&::placeholder': {
      color: theme.colors.text.disabled,
    },
  };

  const labelStyles = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: '0.25rem',
    fontFamily: theme.typography.fontFamily.primary,
  };

  const errorStyles = {
    marginTop: '0.25rem',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.status.error,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const helpStyles = {
    marginTop: '0.25rem',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const requiredStyles = {
    color: theme.colors.status.error,
    marginLeft: '0.25rem',
  };

  // Convert styles object to CSS string for inline styles
  const inputInlineStyles = Object.entries(inputStyles).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return acc;
    }
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    acc[cssKey] = String(value);
    return acc;
  }, {} as Record<string, string>);

  const labelInlineStyles = Object.entries(labelStyles).reduce((acc, [key, value]) => {
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    acc[cssKey] = String(value);
    return acc;
  }, {} as Record<string, string>);

  const errorInlineStyles = Object.entries(errorStyles).reduce((acc, [key, value]) => {
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    acc[cssKey] = String(value);
    return acc;
  }, {} as Record<string, string>);

  const helpInlineStyles = Object.entries(helpStyles).reduce((acc, [key, value]) => {
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    acc[cssKey] = String(value);
    return acc;
  }, {} as Record<string, string>);

  const requiredInlineStyles = Object.entries(requiredStyles).reduce((acc, [key, value]) => {
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    acc[cssKey] = String(value);
    return acc;
  }, {} as Record<string, string>);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label style={labelInlineStyles}>
          {label}
          {required && <span style={requiredInlineStyles}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        style={inputInlineStyles}
        className={className}
      />
      {error && (
        <p style={errorInlineStyles}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p style={helpInlineStyles}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Input;
