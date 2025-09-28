import React from 'react';
export interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    showCharacterCount?: boolean;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export default ChatInput;
//# sourceMappingURL=ChatInput.d.ts.map