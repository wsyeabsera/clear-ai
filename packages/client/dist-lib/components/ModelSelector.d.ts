import React from 'react';
export interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
    disabled?: boolean;
    className?: string;
}
export declare const ModelSelector: React.FC<ModelSelectorProps>;
export default ModelSelector;
//# sourceMappingURL=ModelSelector.d.ts.map