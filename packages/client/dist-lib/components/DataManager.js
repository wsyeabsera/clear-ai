"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Data Manager Component
 *
 * Provides UI for managing conversation data (export/import/clear)
 */
const react_1 = require("react");
const themes_1 = require("../themes");
const useSessionManager_1 = require("../hooks/useSessionManager");
const Button_1 = __importDefault(require("./Button"));
const DataManager = ({ userId }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [isExporting, setIsExporting] = (0, react_1.useState)(false);
    const [isImporting, setIsImporting] = (0, react_1.useState)(false);
    const [isClearing, setIsClearing] = (0, react_1.useState)(false);
    const [stats, setStats] = (0, react_1.useState)(null);
    const { exportData, importData, clearAllData, getStorageStats, } = (0, useSessionManager_1.useSessionManager)({ userId, autoInitialize: false });
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
        if (!confirm('Are you sure you want to clear all conversation data? This action cannot be undone.')) {
            return;
        }
        setIsClearing(true);
        try {
            await clearAllData();
            alert('All data cleared successfully!');
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
    const loadStats = async () => {
        try {
            const statsData = await getStorageStats();
            setStats(statsData);
        }
        catch (error) {
            console.error('Failed to load stats:', error);
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
    const containerStyles = {
        padding: '1rem',
        backgroundColor: theme.colors.background.paper,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        marginBottom: '1rem',
    };
    const titleStyles = {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: '1rem',
    };
    const statsStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
    };
    const statItemStyles = {
        padding: '0.75rem',
        backgroundColor: theme.colors.background.default,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.sm,
        textAlign: 'center',
    };
    const statValueStyles = {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
        marginBottom: '0.25rem',
    };
    const statLabelStyles = {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    };
    const actionsStyles = {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    };
    const hiddenInputStyles = {
        display: 'none',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, children: [(0, jsx_runtime_1.jsx)("h3", { style: titleStyles, children: "Data Management" }), stats && ((0, jsx_runtime_1.jsxs)("div", { style: statsStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: stats.sessionCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Sessions" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: stats.messageCount }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Messages" })] }), (0, jsx_runtime_1.jsxs)("div", { style: statItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: statValueStyles, children: formatBytes(stats.totalStorageSize) }), (0, jsx_runtime_1.jsx)("div", { style: statLabelStyles, children: "Storage Used" })] })] })), (0, jsx_runtime_1.jsxs)("div", { style: actionsStyles, children: [(0, jsx_runtime_1.jsx)(Button_1.default, { onClick: handleExport, disabled: isExporting, variant: "primary", children: isExporting ? 'Exporting...' : 'Export Data' }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => document.getElementById('import-input')?.click(), disabled: isImporting, variant: "secondary", children: isImporting ? 'Importing...' : 'Import Data' }), (0, jsx_runtime_1.jsx)("input", { id: "import-input", type: "file", accept: ".json", onChange: handleImport, style: hiddenInputStyles }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: handleClearAll, disabled: isClearing, variant: "outline", children: isClearing ? 'Clearing...' : 'Clear All Data' }), (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: loadStats, variant: "outline", children: "Refresh Stats" })] })] }));
};
exports.DataManager = DataManager;
exports.default = exports.DataManager;
//# sourceMappingURL=DataManager.js.map