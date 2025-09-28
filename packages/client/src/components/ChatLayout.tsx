import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes';
import { ChatMessage, ChatInput, ChatSidebar } from './index';
import type { ChatMessageProps } from './ChatMessage';
import { useSessionManager } from '../hooks/useSessionManager';
import type { ChatMessage as DBChatMessage } from '../services/indexedDB';

export interface ChatLayoutProps {
  userId: string;
  onSendMessage?: (message: string, sessionId: string) => Promise<{
    content: string;
    metadata?: {
      intent?: { type: string; confidence: number };
      reasoning?: string;
      memoryContext?: any[];
    };
    fullResponseData?: any;
  }>;
  isLoading?: boolean;
  error?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  userId,
  onSendMessage,
  isLoading = false,
  error,
}) => {
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use session manager for persistent storage
  const {
    sessions,
    currentSession,
    messages: dbMessages,
    isLoading: sessionLoading,
    error: sessionError,
    createSession,
    selectSession,
    deleteSession,
    addMessage,
    updateMessage,
  } = useSessionManager({ userId, autoInitialize: true });

  // Convert DB messages to ChatMessageProps format
  const messages: ChatMessageProps[] = dbMessages
    .filter((msg: DBChatMessage) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg: DBChatMessage) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as 'user' | 'assistant',
      timestamp: msg.timestamp,
      metadata: msg.metadata,
      fullResponseData: msg.fullResponseData,
      isLoading: msg.isLoading,
      error: msg.error,
    }));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const layoutStyles = {
    display: 'flex',
    minHeight: 'calc(100vh - 120px)', // Account for header
    height: 'fit-content',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: theme.effects.borderRadius.lg,
    overflow: 'visible',
  };

  const chatAreaStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'transparent',
  };

  const chatHeaderStyles = {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
  };

  const chatTitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const exportButtonStyles = {
    padding: '0.5rem 1rem',
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.background.default,
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.effects.transition.normal,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: theme.colors.primary.dark,
      transform: 'translateY(-1px)',
    },
  };

  const messagesAreaStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem',
    backgroundColor: 'transparent',
    minHeight: '400px',
    maxHeight: 'calc(100vh - 200px)',
  };

  const inputAreaStyles = {
    padding: '1rem',
    backgroundColor: 'transparent',
  };

  const welcomeMessageStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center' as const,
    color: theme.colors.text.secondary,
    padding: '2rem',
  };

  const welcomeTitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: '1rem',
  };

  const welcomeSubtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    marginBottom: '2rem',
  };

  const featureListStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    width: '100%',
  };

  const featureItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const iconStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.background.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  };


  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Ensure we have a current session
    let sessionId = currentSession?.id;
    if (!sessionId) {
      try {
        const newSession = await createSession();
        sessionId = newSession.id;
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    try {
      // Add user message to database
      await addMessage({
        content: message,
        role: 'user',
      });

      // Add loading message for assistant
      const loadingMessage = await addMessage({
        content: '',
        role: 'assistant',
        isLoading: true,
      });

      // Call the onSendMessage prop if provided
      if (onSendMessage) {
        const result = await onSendMessage(message, sessionId);
        
        // Update loading message with actual AI response
        await updateMessage(loadingMessage.id, {
          content: result.content,
          metadata: result.metadata,
          fullResponseData: result.fullResponseData,
          isLoading: false,
        });
        
        // Clear the prompt after sending
        setCurrentPrompt('');
      } else {
        // Default behavior - simulate AI response
        setTimeout(async () => {
          await updateMessage(loadingMessage.id, {
            content: `I received your message: "${message}". This is a placeholder response. Please integrate with the AI agent API to get real responses.`,
            metadata: {
              intent: {
                type: 'general_query',
                confidence: 0.95,
              },
              reasoning: 'This is a placeholder response. The actual AI agent integration is pending.',
            },
            isLoading: false,
          });
          
          // Clear the prompt after sending
          setCurrentPrompt('');
        }, 1000);
      }
    } catch (error) {
      // Update loading message with error
      try {
        const loadingMessage = messages.find(msg => msg.isLoading);
        if (loadingMessage) {
          await updateMessage(loadingMessage.id, {
            content: '',
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false,
          });
        }
      } catch (updateError) {
        console.error('Failed to update message with error:', updateError);
      }
    }
  };

  const handleConfirmAction = async () => {
    try {
      // Send confirmation message
      await handleSendMessage('yes');
    } catch (error) {
      console.error('Failed to confirm action:', error);
    }
  };

  const handleCancelAction = async () => {
    try {
      // Send cancellation message
      await handleSendMessage('no');
    } catch (error) {
      console.error('Failed to cancel action:', error);
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    try {
      await selectSession(sessionId);
    } catch (error) {
      console.error('Failed to select session:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      await createSession();
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleExportConversation = async () => {
    try {
      // Create a clean export of all messages with full data
      const conversationData = dbMessages
        .filter((msg: DBChatMessage) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg: DBChatMessage) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp.toISOString(),
          metadata: msg.metadata,
          fullResponseData: msg.fullResponseData,
          error: msg.error,
        }));

      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(conversationData, null, 2));
      
      // Show success message (you could replace this with a toast notification)
      alert(`Conversation exported to clipboard! (${conversationData.length} messages)`);
    } catch (error) {
      console.error('Failed to export conversation:', error);
      alert('Failed to export conversation. Please try again.');
    }
  };


  return (
    <div style={layoutStyles}>
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div style={chatAreaStyles}>
        {/* Chat Header */}
        {messages.length > 0 && (
          <div style={chatHeaderStyles}>
            <h3 style={chatTitleStyles}>
              {currentSession?.title || 'Chat Conversation'}
            </h3>
            <button
              onClick={handleExportConversation}
              style={exportButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📋 Export Conversation
            </button>
          </div>
        )}
        
        <div style={messagesAreaStyles}>
          {messages.length === 0 ? (
            <div style={welcomeMessageStyles}>
              <h2 style={welcomeTitleStyles}>
                Welcome to Clear AI Chat
              </h2>
              <p style={welcomeSubtitleStyles}>
                Start a conversation with your intelligent AI assistant
              </p>
              
              <div style={featureListStyles}>
                <div style={featureItemStyles}>
                  <div style={iconStyles}>🧠</div>
                  <span>Advanced reasoning and memory integration</span>
                </div>
                <div style={featureItemStyles}>
                  <div style={iconStyles}>💬</div>
                  <span>Natural conversation with context awareness</span>
                </div>
                <div style={featureItemStyles}>
                  <div style={iconStyles}>🔧</div>
                  <span>Tool execution and workflow automation</span>
                </div>
                <div style={featureItemStyles}>
                  <div style={iconStyles}>📚</div>
                  <span>Persistent memory across conversations</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  {...message}
                  onConfirmAction={handleConfirmAction}
                  onCancelAction={handleCancelAction}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div style={inputAreaStyles}>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || sessionLoading}
            placeholder={error || sessionError ? 'Error occurred. Try again...' : 'Type your message...'}
            value={currentPrompt}
            onChange={setCurrentPrompt}
            showPromptSelector={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
