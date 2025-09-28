import React, { useState } from 'react';
import { useTheme } from '../themes';
import { JsonModal } from './JsonModal';
import { ConfirmationButtons } from './ConfirmationButtons';

export interface ChatMessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  metadata?: {
    intent?: {
      type: string;
      confidence: number;
    };
    reasoning?: string;
    memoryContext?: any[];
  };
  fullResponseData?: any; // Complete API response for JSON modal
  onConfirmAction?: () => void;
  onCancelAction?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
  isLoading = false,
  error,
  metadata,
  fullResponseData,
  onConfirmAction,
  onCancelAction
}) => {
  const { theme } = useTheme();
  const [showMetadata, setShowMetadata] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  // Check if this is a confirmation request
  const isConfirmationRequest = isAssistant && 
    content.includes('Would you like me to perform this action for you?') &&
    onConfirmAction && 
    onCancelAction;

  const messageStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    marginBottom: '1rem',
    alignItems: isUser ? 'flex-end' : 'flex-start',
  };

  const bubbleStyles = {
    maxWidth: '90%',
    padding: '0.75rem 1rem',
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: isUser 
      ? theme.colors.primary.main 
      : 'rgba(255, 255, 255, 0.1)',
    color: isUser 
      ? theme.colors.background.default 
      : theme.colors.text.primary,
    border: 'none',
    backdropFilter: 'blur(10px)',
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  };

  const timestampStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: '0.25rem',
    marginBottom: '0.5rem',
  };

  const metadataButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.disabled,
    fontSize: theme.typography.fontSize.xs,
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: theme.effects.borderRadius.sm,
    marginTop: '0.5rem',
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      color: theme.colors.text.secondary,
    },
  };

  const metadataStyles = {
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.effects.borderRadius.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const loadingStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: theme.colors.text.disabled,
  };

  const errorStyles = {
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: theme.colors.status.error + '10',
    borderRadius: theme.effects.borderRadius.sm,
    border: `1px solid ${theme.colors.status.error}40`,
  };

  const LoadingDots = () => (
    <div style={loadingStyles}>
      <span>Thinking</span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: theme.colors.text.disabled,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: theme.colors.text.disabled,
          animation: 'pulse 1.5s ease-in-out infinite 0.2s',
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: theme.colors.text.disabled,
          animation: 'pulse 1.5s ease-in-out infinite 0.4s',
        }} />
      </div>
    </div>
  );

  return (
    <div style={messageStyles}>
      <div style={timestampStyles}>
        {timestamp.toLocaleTimeString()}
      </div>
      
      <div style={bubbleStyles}>
        {isLoading ? (
          <LoadingDots />
        ) : error ? (
          <div style={errorStyles}>
            Error: {error}
          </div>
        ) : (
          <>
            {content}
            {isConfirmationRequest && (
              <ConfirmationButtons
                onConfirm={onConfirmAction!}
                onCancel={onCancelAction!}
                isLoading={isLoading}
              />
            )}
            {isAssistant && metadata && (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    style={metadataButtonStyles}
                    onClick={() => setShowMetadata(!showMetadata)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                      e.currentTarget.style.color = theme.colors.text.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.text.disabled;
                    }}
                  >
                    {showMetadata ? 'Hide Details' : 'Show Details'}
                  </button>
                  
                  {fullResponseData && (
                    <button
                      style={{
                        ...metadataButtonStyles,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      onClick={() => setShowJsonModal(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                        e.currentTarget.style.color = theme.colors.text.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.colors.text.disabled;
                      }}
                      title="View full JSON response"
                    >
                      <span>📄</span>
                      <span>JSON</span>
                    </button>
                  )}
                </div>
                
                {showMetadata && (
                  <div style={metadataStyles}>
                    {metadata.intent && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Intent:</strong> {metadata.intent.type} 
                        <span style={{ color: theme.colors.text.disabled, marginLeft: '0.5rem' }}>
                          (confidence: {(metadata.intent.confidence * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                    
                    {metadata.reasoning && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Reasoning:</strong>
                        <div style={{ 
                          marginTop: '0.25rem', 
                          padding: '0.5rem',
                          backgroundColor: theme.colors.background.default,
                          borderRadius: theme.effects.borderRadius.sm,
                          fontFamily: 'monospace',
                          fontSize: theme.typography.fontSize.xs,
                        }}>
                          {metadata.reasoning}
                        </div>
                      </div>
                    )}
                    
                    {metadata.memoryContext && metadata.memoryContext.length > 0 && (
                      <div>
                        <strong>Memory Context:</strong>
                        <div style={{ 
                          marginTop: '0.25rem',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}>
                          {metadata.memoryContext.map((memory, index) => (
                            <div 
                              key={index}
                              style={{ 
                                marginBottom: '0.25rem',
                                padding: '0.25rem',
                                backgroundColor: theme.colors.background.default,
                                borderRadius: theme.effects.borderRadius.sm,
                                fontSize: theme.typography.fontSize.xs,
                              }}
                            >
                              <strong>{memory.type}:</strong> {memory.content}
                              {memory.relevance && (
                                <span style={{ color: theme.colors.text.disabled, marginLeft: '0.5rem' }}>
                                  (relevance: {(memory.relevance * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      {/* JSON Modal */}
      {fullResponseData && (
        <JsonModal
          isOpen={showJsonModal}
          onClose={() => setShowJsonModal(false)}
          data={fullResponseData}
          title="Full Response Data"
        />
      )}
    </div>
  );
};

export default ChatMessage;
