"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManagerModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Data Manager Modal Component
 *
 * Modal interface for managing conversation data (export/import/clear)
 */
const react_1 = __importStar(require("react"));
const themes_1 = require("../themes");
const useSessionManager_1 = require("../hooks/useSessionManager");
const api_1 = require("../services/api");
const Button_1 = __importDefault(require("./Button"));
const DataManagerModal = ({ userId, isOpen, onClose }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [isExporting, setIsExporting] = (0, react_1.useState)(false);
    const [isImporting, setIsImporting] = (0, react_1.useState)(false);
    const [isClearing, setIsClearing] = (0, react_1.useState)(false);
    const [stats, setStats] = (0, react_1.useState)(null);
    const [memoryStats, setMemoryStats] = (0, react_1.useState)(null);
    const { exportData, importData, clearAllData, getStorageStats, sessionManager, } = (0, useSessionManager_1.useSessionManager)({ userId, autoInitialize: false });
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clear-ai-conversations-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Failed to export data:', error);
            alert('Failed to export data. Please try again.');
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsImporting(true);
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await importData(data);
            alert('Data imported successfully!');
            // Refresh stats
            await loadStats();
        }
        catch (error) {
            console.error('Failed to import data:', error);
            alert('Failed to import data. Please check the file format.');
        }
        finally {
            setIsImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };
    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear all conversation data? This will remove:\n\n• All chat sessions and messages (IndexedDB)\n• All episodic memories (Neo4j)\n• All semantic memories (Neo4j)\n\nThis action cannot be undone.')) {
            return;
        }
        setIsClearing(true);
        try {
            await clearAllData();
            alert('All data cleared successfully!\n\n✅ Chat sessions and messages removed\n✅ Episodic memories cleared from Neo4j\n✅ Semantic memories cleared from Neo4j');
            // Refresh stats
            await loadStats();
        }
        catch (error) {
            console.error('Failed to clear data:', error);
            alert('Failed to clear data. Please try again.');
        }
        finally {
            setIsClearing(false);
        }
    };
    const handleClearSemanticMemories = async () => {
        if (!confirm('Are you sure you want to clear your knowledge base? This will remove:\n\n• All semantic memories (your learned knowledge)\n• The AI will forget what it has learned about you\n\nThis action cannot be undone.')) {
            return;
        }
        try {
            await sessionManager.clearSemanticMemories();
            alert('Knowledge base cleared successfully!\n\n✅ Semantic memories removed\n✅ AI will start fresh with new knowledge');
            // Refresh memory stats
            await loadMemoryStats();
        }
        catch (error) {
            console.error('Failed to clear semantic memories:', error);
            alert('Failed to clear knowledge base. Please try again.');
        }
    };
    const loadStats = async () => {
        try {
            const statsData = await getStorageStats();
            setStats(statsData);
        }
        catch (error) {
            console.error('Failed to load stats:', error);
        }
    };
    const loadMemoryStats = async () => {
        try {
            const memoryStatsData = await api_1.apiService.getMemoryStats(userId);
            if (memoryStatsData.success) {
                setMemoryStats(memoryStatsData.data);
            }
        }
        catch (error) {
            console.error('Failed to load memory stats:', error);
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    // Load stats when modal opens
    react_1.default.useEffect(() => {
        if (isOpen) {
            loadStats();
            loadMemoryStats();
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const overlayStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    };
    const modalStyles = {
        backgroundColor: theme.colors.background.paper,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.lg,
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: theme.effects.shadow.lg,
    };
    const headerStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${theme.colors.border.default}`,
    };
    const titleStyles = {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        margin: 0,
    };
    const closeButtonStyles = {
        padding: '0.5rem',
        backgroundColor: 'transparent',
        color: theme.colors.text.secondary,
        border: 'none',
        borderRadius: theme.effects.borderRadius.sm,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.lg,
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.interactive.hover,
            color: theme.colors.text.primary,
        },
    };
    const statsStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    };
    const statItemStyles = {
        padding: '1rem',
        backgroundColor: theme.colors.background.default,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        textAlign: 'center',
    };
    const statValueStyles = {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
        marginBottom: '0.5rem',
    };
    const statLabelStyles = {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    };
    const actionsStyles = {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    };
    const hiddenInputStyles = {
        display: 'none',
    };
    const descriptionStyles = {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginBottom: '1.5rem',
        textAlign: 'center',
        lineHeight: 1.5,
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: overlayStyles, onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { style: modalStyles, onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { style: headerStyles, children: [(0, jsx_runtime_1.jsx)("h2", { style: titleStyles, children: "Data Management" }), (0, jsx_runtime_1.jsx)("button", { style: closeButtonStyles, onClick: onClose, title: "Close", children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("p", { style: descriptionStyles, children: "Manage your conversation data. Export to backup, import to restore, or clear all data including Neo4j memories." }), stats && ((0, jsx_runtime_1.jsxs)("div", { style: statsStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: stats.sessionCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Chat Sessions" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: stats.messageCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Messages" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: formatBytes(stats.totalStorageSize) }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Local Storage" })] })] })), memoryStats && ((0, jsx_runtime_1.jsxs)("div", { style: statsStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: memoryStats.episodicCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Episodic Memories" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: memoryStats.semanticCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Semantic Memories" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: memoryStats.totalMemories }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Total Memories (Neo4j)" })] })] })), (0, jsx_runtime_1.jsxs)("div", { style: actionsStyles, children: [(0, jsx_runtime_1.jsx)(Button_1.default, { onClick: handleExport, disabled: isExporting, variant: "primary", children: isExporting ? 'Exporting...' : 'Export Data' }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => document.getElementById('import-input-modal')?.click(), disabled: isImporting, variant: "secondary", children: isImporting ? 'Importing...' : 'Import Data' }), (0, jsx_runtime_1.jsx)("input", { id: "import-input-modal", type: "file", accept: ".json", onChange: handleImport, style: hiddenInputStyles }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: handleClearSemanticMemories, variant: "outline", children: "Clear Knowledge Base" }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: handleClearAll, disabled: isClearing, variant: "outline", children: isClearing ? 'Clearing...' : 'Clear All Data' }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                                loadStats();
                                loadMemoryStats();
                            }, variant: "ghost", children: "Refresh Stats" })] })] }) }));
};
exports.DataManagerModal = DataManagerModal;
exports.default = exports.DataManagerModal;
//# sourceMappingURL=DataManagerModal.js.map