import React from 'react';
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

  const containerStyles = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
    justifyContent: 'flex-start',
    alignItems: 'center',
  };

  return (
    <div style={containerStyles}>
      <Button
        onClick={onConfirm}
        disabled={isLoading}
        size="sm"
      >
        {isLoading ? '⏳ Processing...' : `✅ ${confirmText}`}
      </Button>
      
      <Button
        onClick={onCancel}
        disabled={isLoading}
        size="sm"
      >
        ❌ {cancelText}
      </Button>
    </div>
  );
};

export default ConfirmationButtons;
