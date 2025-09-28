import React, { useState } from 'react';
import { useTheme } from '../themes';
import { PromptModal } from './PromptModal';

export interface PromptSelectorProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  onPromptSelect,
  disabled = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonStyles = {
    padding: '0.5rem 1rem',
    backgroundColor: disabled 
      ? theme.colors.interactive.disabled 
      : theme.colors.primary.main,
    color: disabled 
      ? theme.colors.text.disabled 
      : theme.colors.background.default,
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.effects.transition.normal,
    opacity: disabled ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: disabled 
        ? theme.colors.interactive.disabled 
        : theme.colors.primary.dark,
      transform: disabled ? 'none' : 'translateY(-1px)',
    },
  };

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    setIsModalOpen(false);
  };

  return (
    <>
      <div style={{ display: 'inline-block' }} className={className}>
        <button
          style={buttonStyles}
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = theme.colors.primary.main;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
          title="Select example prompt"
        >
          <span>💡</span>
          <span>Prompts</span>
        </button>
      </div>

      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPromptSelect={handlePromptSelect}
        disabled={disabled}
      />
    </>
  );
};

export default PromptSelector;
