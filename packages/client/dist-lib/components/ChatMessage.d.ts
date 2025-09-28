import React from 'react';
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
    fullResponseData?: any;
}
export declare const ChatMessage: React.FC<ChatMessageProps>;
export default ChatMessage;
//# sourceMappingURL=ChatMessage.d.ts.map