import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes';
import { PromptSelector } from './PromptSelector';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  showPromptSelector?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000,
  showCharacterCount = true,
  value,
  onChange,
  showPromptSelector = false,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : message;
  const setCurrentValue = value !== undefined ? onChange || (() => {}) : setMessage;
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: theme.effects.borderRadius.lg,
    backdropFilter: 'blur(10px)',
  };

  const textareaStyles = {
    width: '100%',
    minHeight: '60px',
    maxHeight: '200px',
    padding: '0.75rem',
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    resize: 'none' as const,
    outline: 'none',
    transition: theme.effects.transition.normal,
    backdropFilter: 'blur(5px)',
    '&:focus': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    '&::placeholder': {
      color: theme.colors.text.disabled,
    },
  };

  const bottomRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  };

  const characterCountStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: currentValue.length > maxLength * 0.9 
      ? theme.colors.status.warning 
      : theme.colors.text.disabled,
  };

  const sendButtonStyles = {
    padding: '0.5rem 1.5rem',
    backgroundColor: currentValue.trim() && !disabled 
      ? theme.colors.primary.main 
      : theme.colors.interactive.disabled,
    color: currentValue.trim() && !disabled 
      ? theme.colors.background.default 
      : theme.colors.text.disabled,
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: currentValue.trim() && !disabled ? 'pointer' : 'not-allowed',
    transition: theme.effects.transition.normal,
    opacity: disabled ? 0.6 : 1,
    '&:hover': {
      backgroundColor: currentValue.trim() && !disabled 
        ? theme.colors.primary.dark 
        : theme.colors.interactive.disabled,
      transform: currentValue.trim() && !disabled ? 'translateY(-1px)' : 'none',
    },
    '&:active': {
      transform: currentValue.trim() && !disabled ? 'translateY(0)' : 'none',
    },
  };

  const shortcutsStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    display: 'flex',
    gap: '1rem',
  };

  const shortcutStyles = {
    color: theme.colors.text.disabled,
    textDecoration: 'none',
    '&:hover': {
      color: theme.colors.text.secondary,
    },
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setCurrentValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter to send (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleSend = () => {
    const trimmedMessage = currentValue.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setCurrentValue('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow paste but truncate if necessary
    const pastedText = e.clipboardData.getData('text');
    if (currentValue.length + pastedText.length > maxLength) {
      e.preventDefault();
      const remainingSpace = maxLength - currentValue.length;
      const truncatedText = pastedText.substring(0, remainingSpace);
      setCurrentValue(currentValue + truncatedText);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setCurrentValue(prompt);
    // Focus the textarea after selecting a prompt
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div style={containerStyles}>
      {showPromptSelector && (
        <div style={{ marginBottom: '0.5rem' }}>
          <PromptSelector
            onPromptSelect={handlePromptSelect}
            disabled={disabled}
          />
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        style={textareaStyles}
        rows={1}
      />
      
      <div style={bottomRowStyles}>
        <div style={shortcutsStyles}>
          <span style={shortcutStyles}>Enter to send</span>
          <span style={shortcutStyles}>Shift+Enter for new line</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showCharacterCount && (
            <span style={characterCountStyles}>
              {currentValue.length}/{maxLength}
            </span>
          )}
          
          <button
            onClick={handleSend}
            disabled={!currentValue.trim() || disabled}
            style={sendButtonStyles}
            onMouseEnter={(e) => {
              if (currentValue.trim() && !disabled) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentValue.trim() && !disabled) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
