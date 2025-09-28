import React from 'react';
import { useTheme } from '../themes';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { theme } = useTheme();

  const sidebarStyles = {
    width: isCollapsed ? '60px' : '280px',
    height: '100%',
    backgroundColor: theme.colors.background.paper,
    borderRight: `1px solid ${theme.colors.border.default}`,
    display: 'flex',
    flexDirection: 'column' as const,
    transition: theme.effects.transition.normal,
    overflow: 'hidden',
  };

  const headerStyles = {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
    opacity: isCollapsed ? 0 : 1,
    transition: theme.effects.transition.normal,
  };

  const newChatButtonStyles = {
    padding: '0.5rem',
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
    opacity: isCollapsed ? 0 : 1,
    width: isCollapsed ? '40px' : 'auto',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.colors.primary.dark,
      transform: 'translateY(-1px)',
    },
  };

  const collapseButtonStyles = {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: 'none',
    borderRadius: theme.effects.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      color: theme.colors.text.primary,
    },
  };

  const sessionsListStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.5rem',
  };

  const sessionItemStyles = (isActive: boolean) => ({
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: isActive 
      ? theme.colors.primary.main + '20' 
      : 'transparent',
    border: isActive 
      ? `1px solid ${theme.colors.primary.main}40` 
      : `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    cursor: 'pointer',
    transition: theme.effects.transition.normal,
    position: 'relative' as const,
    opacity: isCollapsed ? 0 : 1,
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: isActive 
        ? theme.colors.primary.main + '30' 
        : theme.colors.interactive.hover,
      transform: 'translateY(-1px)',
      boxShadow: theme.effects.shadow.sm,
    },
  });

  const sessionTitleStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  };

  const sessionPreviewStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    marginBottom: '0.25rem',
  };

  const sessionMetaStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const deleteButtonStyles = {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.25rem',
    backgroundColor: theme.colors.status.error + '20',
    color: theme.colors.status.error,
    border: 'none',
    borderRadius: theme.effects.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.xs,
    opacity: 0,
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.status.error,
      color: theme.colors.background.default,
      opacity: 1,
    },
  };

  const emptyStateStyles = {
    padding: '2rem 1rem',
    textAlign: 'center' as const,
    color: theme.colors.text.disabled,
    fontSize: theme.typography.fontSize.sm,
    opacity: isCollapsed ? 0 : 1,
    transition: theme.effects.transition.normal,
  };

  const collapsedIconStyles = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
  };

  const collapsedSessionStyles = {
    width: '40px',
    height: '40px',
    backgroundColor: theme.colors.interactive.hover,
    borderRadius: theme.effects.borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.background.default,
    },
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleSessionClick = (sessionId: string, e: React.MouseEvent) => {
    // Don't trigger if clicking delete button
    if ((e.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    onSessionSelect(sessionId);
  };

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  if (isCollapsed) {
    return (
      <div style={sidebarStyles}>
        <div style={headerStyles}>
          <button
            style={collapseButtonStyles}
            onClick={onToggleCollapse}
            title="Expand sidebar"
          >
            →
          </button>
        </div>
        
        <div style={collapsedIconStyles}>
          <button
            style={newChatButtonStyles}
            onClick={onNewSession}
            title="New chat"
          >
            +
          </button>
          
          {sessions.slice(0, 10).map((session, index) => (
            <div
              key={session.id}
              style={{
                ...collapsedSessionStyles,
                backgroundColor: currentSessionId === session.id 
                  ? theme.colors.primary.main 
                  : theme.colors.interactive.hover,
                color: currentSessionId === session.id 
                  ? theme.colors.background.default 
                  : theme.colors.text.secondary,
              }}
              onClick={(e) => handleSessionClick(session.id, e)}
              title={session.title}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={sidebarStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Chat History</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            style={newChatButtonStyles}
            onClick={onNewSession}
          >
            + New Chat
          </button>
          <button
            style={collapseButtonStyles}
            onClick={onToggleCollapse}
            title="Collapse sidebar"
          >
            ←
          </button>
        </div>
      </div>
      
      <div style={sessionsListStyles}>
        {sessions.length === 0 ? (
          <div style={emptyStateStyles}>
            No chat history yet.<br />
            Start a new conversation!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              style={sessionItemStyles(currentSessionId === session.id)}
              onClick={(e) => handleSessionClick(session.id, e)}
              onMouseEnter={(e) => {
                const deleteBtn = e.currentTarget.querySelector('[data-delete-button]') as HTMLElement;
                if (deleteBtn) deleteBtn.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const deleteBtn = e.currentTarget.querySelector('[data-delete-button]') as HTMLElement;
                if (deleteBtn) deleteBtn.style.opacity = '0';
              }}
            >
              <div style={sessionTitleStyles}>
                {session.title}
              </div>
              <div style={sessionPreviewStyles}>
                {session.lastMessage}
              </div>
              <div style={sessionMetaStyles}>
                <span>{formatTime(session.timestamp)}</span>
                <span>{session.messageCount} messages</span>
              </div>
              
              <button
                data-delete-button
                style={deleteButtonStyles}
                onClick={(e) => handleDeleteClick(session.id, e)}
                title="Delete chat"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
