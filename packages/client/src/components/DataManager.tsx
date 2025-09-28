/**
 * Data Manager Component
 * 
 * Provides UI for managing conversation data (export/import/clear)
 */

import React, { useState } from 'react';
import { useTheme } from '../themes';
import { useSessionManager } from '../hooks/useSessionManager';
import Button from './Button';

export interface DataManagerProps {
  userId: string;
}

export const DataManager: React.FC<DataManagerProps> = ({ userId }) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [stats, setStats] = useState<{ sessionCount: number; messageCount: number; totalStorageSize: number } | null>(null);
  
  const {
    exportData,
    importData,
    clearAllData,
    getStorageStats,
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
    if (!confirm('Are you sure you want to clear all conversation data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      alert('All data cleared successfully!');
      // Refresh stats
      await loadStats();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
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

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
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
    textAlign: 'center' as const,
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
    flexWrap: 'wrap' as const,
  };

  const hiddenInputStyles = {
    display: 'none',
  };

  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>Data Management</h3>
      
      {stats && (
        <div style={statsStyles}>
          <div style={statItemStyles}>
            <div style={statValueStyles}>{stats.sessionCount}</div>
            <div style={statLabelStyles}>Sessions</div>
          </div>
          <div style={statItemStyles}>
            <div style={statValueStyles}>{stats.messageCount}</div>
            <div style={statLabelStyles}>Messages</div>
          </div>
          <div style={statItemStyles}>
            <div style={statValueStyles}>{formatBytes(stats.totalStorageSize)}</div>
            <div style={statLabelStyles}>Storage Used</div>
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
          onClick={() => document.getElementById('import-input')?.click()}
          disabled={isImporting}
          variant="secondary"
        >
          {isImporting ? 'Importing...' : 'Import Data'}
        </Button>

        <input
          id="import-input"
          type="file"
          accept=".json"
          onChange={handleImport}
          style={hiddenInputStyles}
        />

        <Button
          onClick={handleClearAll}
          disabled={isClearing}
          variant="outline"
        >
          {isClearing ? 'Clearing...' : 'Clear All Data'}
        </Button>

        <Button
          onClick={loadStats}
          variant="outline"
        >
          Refresh Stats
        </Button>
      </div>
    </div>
  );
};

export default DataManager;
