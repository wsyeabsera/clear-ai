/**
 * Data Manager Modal Component
 *
 * Modal interface for managing conversation data (export/import/clear)
 */
import React from 'react';
export interface DataManagerModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}
export declare const DataManagerModal: React.FC<DataManagerModalProps>;
export default DataManagerModal;
//# sourceMappingURL=DataManagerModal.d.ts.map