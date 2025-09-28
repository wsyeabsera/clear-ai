import React from 'react';
export interface ExamplePrompt {
    id: string;
    text: string;
    category: string;
    description?: string;
}
export interface PromptCategory {
    name: string;
    description: string;
    prompts: ExamplePrompt[];
}
export interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPromptSelect: (prompt: string) => void;
    disabled?: boolean;
}
export declare const PromptModal: React.FC<PromptModalProps>;
export default PromptModal;
//# sourceMappingURL=PromptModal.d.ts.map