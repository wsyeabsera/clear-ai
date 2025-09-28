import React from 'react';
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
export declare const ChatSidebar: React.FC<ChatSidebarProps>;
export default ChatSidebar;
//# sourceMappingURL=ChatSidebar.d.ts.map