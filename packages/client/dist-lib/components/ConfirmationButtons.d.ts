import React from 'react';
export interface ConfirmationButtonsProps {
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
}
export declare const ConfirmationButtons: React.FC<ConfirmationButtonsProps>;
export default ConfirmationButtons;
//# sourceMappingURL=ConfirmationButtons.d.ts.map