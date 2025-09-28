/**
 * Data Manager Modal Component
 * 
 * Modal interface for managing conversation data (export/import/clear)
 */

import React, { useState } from 'react';
import { useTheme } from '../themes';
import { useSessionManager } from '../hooks/useSessionManager';
import { apiService } from '../services/api';
import Button from './Button';

export interface DataManagerModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({ 
  userId, 
  isOpen, 
  onClose 
}) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [stats, setStats] = useState<{ sessionCount: number; messageCount: number; totalStorageSize: number } | null>(null);
  const [memoryStats, setMemoryStats] = useState<{ episodicCount: number; semanticCount: number; totalMemories: number } | null>(null);
  
  const {
    exportData,
    importData,
    clearAllData,
    getStorageStats,
    sessionManager,
  } = useSessionManager({ userId, autoInitialize: false });

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
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      alert('Data imported successfully!');
      // Refresh stats
      await loadStats();
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
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
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
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
    } catch (error) {
      console.error('Failed to clear semantic memories:', error);
      alert('Failed to clear knowledge base. Please try again.');
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getStorageStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMemoryStats = async () => {
    try {
      const memoryStatsData = await apiService.getMemoryStats(userId);
      if (memoryStatsData.success) {
        setMemoryStats(memoryStatsData.data);
      }
    } catch (error) {
      console.error('Failed to load memory stats:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load stats when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadStats();
      loadMemoryStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed' as const,
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
    overflowY: 'auto' as const,
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
    textAlign: 'center' as const,
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
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  };

  const hiddenInputStyles = {
    display: 'none',
  };

  const descriptionStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    lineHeight: 1.5,
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>Data Management</h2>
          <button style={closeButtonStyles} onClick={onClose} title="Close">
            ×
          </button>
        </div>

        <p style={descriptionStyles}>
          Manage your conversation data. Export to backup, import to restore, or clear all data including Neo4j memories.
        </p>
        
        {stats && (
          <div style={statsStyles}>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{stats.sessionCount}</div>
              <div style={statLabelStyles}>Chat Sessions</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{stats.messageCount}</div>
              <div style={statLabelStyles}>Messages</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{formatBytes(stats.totalStorageSize)}</div>
              <div style={statLabelStyles}>Local Storage</div>
            </div>
          </div>
        )}

        {memoryStats && (
          <div style={statsStyles}>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{memoryStats.episodicCount}</div>
              <div style={statLabelStyles}>Episodic Memories</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{memoryStats.semanticCount}</div>
              <div style={statLabelStyles}>Semantic Memories</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{memoryStats.totalMemories}</div>
              <div style={statLabelStyles}>Total Memories (Neo4j)</div>
            </div>
          </div>
        )}

        <div style={actionsStyles}>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="primary"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>

          <Button
            onClick={() => document.getElementById('import-input-modal')?.click()}
            disabled={isImporting}
            variant="secondary"
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>

          <input
            id="import-input-modal"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={hiddenInputStyles}
          />

          <Button
            onClick={handleClearSemanticMemories}
            variant="outline"
          >
            Clear Knowledge Base
          </Button>

          <Button
            onClick={handleClearAll}
            disabled={isClearing}
            variant="outline"
          >
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </Button>

        <Button
          onClick={() => {
            loadStats();
            loadMemoryStats();
          }}
          variant="ghost"
        >
          Refresh Stats
        </Button>
        </div>
      </div>
    </div>
  );
};

export default DataManagerModal;
