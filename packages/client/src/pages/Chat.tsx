import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import { ChatLayout, ModelSelector, DataManagerModal } from '../components';
import { apiService } from '../services/api';
import Button from '../components/Button';

export const Chat: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  // Hardcoded user ID as requested
  const userId = 'clear-ai-user-002';

  // Check server connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        await apiService.getHealth();
        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        setConnectionStatus('disconnected');
        setError(err instanceof Error ? err.message : 'Failed to connect to server');
      }
    };

    checkConnection();
  }, []);

  const handleSendMessage = async (message: string, sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the advanced agent API endpoint
      const response = await apiService.executeAgentQuery(message, {
        userId: userId,
        sessionId: sessionId,
        includeMemoryContext: true,
        includeReasoning: true,
        model: selectedModel,
        temperature: 0.7,
      });

      if (response.success) {
        const result = response.data;
        
        // The response should contain the AI's response and metadata
        // You might need to adjust this based on your actual API response structure
        const aiResponse = result.response || result.content || 'No response received';
        const metadata = {
          intent: result.intent,
          reasoning: result.reasoning,
          memoryContext: result.retrievedMemories || result.memoryContext,
        };

        console.log('AI Response:', aiResponse);
        console.log('Metadata:', metadata);
        
        // Return the response data for ChatLayout to handle
        return {
          content: aiResponse,
          metadata: metadata,
          fullResponseData: response, // Pass the complete response
        };
        
      } else {
        throw new Error(response.message || 'Failed to get response from AI agent');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      
      // Re-throw so ChatLayout can handle the error display
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const pageStyles = {
    minHeight: 'calc(100vh - 120px)', // Account for header
    height: 'fit-content',
    width: '100%',
    backgroundColor: 'transparent',
  };

  const statusBarStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    marginBottom: '1rem',
    fontSize: theme.typography.fontSize.sm,
    gap: '1rem',
    backdropFilter: 'blur(10px)',
  };

  const statusIndicatorStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const statusDotStyles = (status: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: status === 'connected' 
      ? theme.colors.status.success 
      : status === 'connecting' 
      ? theme.colors.status.warning 
      : theme.colors.status.error,
  });

  const userInfoStyles = {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
  };

  const errorBannerStyles = {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div style={pageStyles}>
      {/* Status Bar */}
      <div style={statusBarStyles}>
        <div style={statusIndicatorStyles}>
          <div style={statusDotStyles(connectionStatus)} />
          <span style={{ 
            color: connectionStatus === 'connected' 
              ? theme.colors.status.success 
              : connectionStatus === 'connecting' 
              ? theme.colors.status.warning 
              : theme.colors.status.error 
          }}>
            {connectionStatus === 'connected' ? 'Connected to AI Agent' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
        
        <div style={rightSectionStyles}>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading || connectionStatus !== 'connected'}
          />
          
          <Button
            onClick={() => setIsDataManagerOpen(true)}
            variant="ghost"
            size="sm"
          >
            📊 Data
          </Button>

          <div style={userInfoStyles}>
            User: {userId}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={errorBannerStyles}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Chat Interface */}
      <ChatLayout
        userId={userId}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error || undefined}
      />

      {/* Data Manager Modal */}
      <DataManagerModal
        userId={userId}
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </div>
  );
};

export default Chat;
