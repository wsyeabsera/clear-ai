import React from 'react';
import { useTheme } from '../themes';
import Button from './Button';

export interface ConfirmationButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Yes, do it',
  cancelText = 'No, cancel'
}) => {
  const { theme } = useTheme();

  const containerStyles = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
    justifyContent: 'flex-start',
    alignItems: 'center',
  };

  const buttonStyles = {
    minWidth: '120px',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const confirmButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.colors.status.success,
    color: theme.colors.background.default,
    border: `1px solid ${theme.colors.status.success}`,
    '&:hover': {
      backgroundColor: theme.colors.status.success + 'dd',
    },
    '&:disabled': {
      backgroundColor: theme.colors.text.disabled,
      borderColor: theme.colors.text.disabled,
      cursor: 'not-allowed',
    },
  };

  const cancelButtonStyles = {
    ...buttonStyles,
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: `1px solid ${theme.colors.border.default}`,
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      color: theme.colors.text.primary,
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: theme.colors.text.disabled,
      borderColor: theme.colors.text.disabled,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={containerStyles}>
      <Button
        onClick={onConfirm}
        disabled={isLoading}
        style={confirmButtonStyles}
        size="sm"
      >
        {isLoading ? '⏳ Processing...' : `✅ ${confirmText}`}
      </Button>
      
      <Button
        onClick={onCancel}
        disabled={isLoading}
        style={cancelButtonStyles}
        size="sm"
      >
        ❌ {cancelText}
      </Button>
    </div>
  );
};

export default ConfirmationButtons;
