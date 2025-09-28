import React from 'react';
export interface ChatLayoutProps {
    userId?: string;
    onSendMessage?: (message: string, sessionId: string) => Promise<{
        content: string;
        metadata?: {
            intent?: {
                type: string;
                confidence: number;
            };
            reasoning?: string;
            memoryContext?: any[];
        };
        fullResponseData?: any;
    }>;
    isLoading?: boolean;
    error?: string;
}
export declare const ChatLayout: React.FC<ChatLayoutProps>;
export default ChatLayout;
//# sourceMappingURL=ChatLayout.d.ts.map