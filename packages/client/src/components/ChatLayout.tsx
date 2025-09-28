import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes';
import { ChatMessage, ChatInput, ChatSidebar } from './index';
import type { ChatMessageProps } from './ChatMessage';
import type { ChatSession } from './ChatSidebar';

export interface ChatLayoutProps {
  userId?: string;
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
  onSendMessage,
  isLoading = false,
  error,
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with a default session
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New Chat',
        lastMessage: 'Start a conversation...',
        timestamp: new Date(),
        messageCount: 0,
      };
      setSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
    }
  }, [sessions.length]);

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
    if (!message.trim() || !currentSessionId) return;

    // Add user message immediately
    const userMessage: ChatMessageProps = {
      id: `msg-${Date.now()}-user`,
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading message for assistant
    const loadingMessage: ChatMessageProps = {
      id: `msg-${Date.now()}-loading`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Call the onSendMessage prop if provided
      if (onSendMessage) {
        const result = await onSendMessage(message, currentSessionId);
        
        // Replace loading message with actual AI response
        const assistantMessage: ChatMessageProps = {
          id: `msg-${Date.now()}-assistant`,
          content: result.content,
          role: 'assistant',
          timestamp: new Date(),
          metadata: result.metadata,
          fullResponseData: result.fullResponseData,
        };

        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
          return [...filtered, assistantMessage];
        });

        // Update session
        updateSession(currentSessionId, message, result.content);
        
        // Clear the prompt after sending
        setCurrentPrompt('');
      } else {
        // Default behavior - simulate AI response
        setTimeout(() => {
          const assistantMessage: ChatMessageProps = {
            id: `msg-${Date.now()}-assistant`,
            content: `I received your message: "${message}". This is a placeholder response. Please integrate with the AI agent API to get real responses.`,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              intent: {
                type: 'general_query',
                confidence: 0.95,
              },
              reasoning: 'This is a placeholder response. The actual AI agent integration is pending.',
            },
          };

          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
            return [...filtered, assistantMessage];
          });

          // Update session
          updateSession(currentSessionId, message, assistantMessage.content);
          
          // Clear the prompt after sending
          setCurrentPrompt('');
        }, 1000);
      }
    } catch (error) {
      // Replace loading message with error
      const errorMessage: ChatMessageProps = {
        id: `msg-${Date.now()}-error`,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'An error occurred',
      };

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...filtered, errorMessage];
      });
    }
  };

  const updateSession = (sessionId: string, userMessage: string, assistantResponse: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          title: session.title === 'New Chat' ? userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') : session.title,
          lastMessage: assistantResponse.slice(0, 100) + (assistantResponse.length > 100 ? '...' : ''),
          timestamp: new Date(),
          messageCount: session.messageCount + 2, // User + Assistant
        };
      }
      return session;
    }));
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // In a real app, you'd load messages for this session
    // For now, we'll just clear messages when switching sessions
    setMessages([]);
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      lastMessage: 'Start a conversation...',
      timestamp: new Date(),
      messageCount: 0,
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (sessionId === currentSessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setMessages([]);
      } else {
        handleNewSession();
      }
    }
  };


  return (
    <div style={layoutStyles}>
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div style={chatAreaStyles}>
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
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div style={inputAreaStyles}>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={error ? 'Error occurred. Try again...' : 'Type your message...'}
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
