import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import { apiService, AvailableModels } from '../services/api';

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const [models, setModels] = useState<AvailableModels | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const availableModels = await apiService.getAvailableModels();
        setModels(availableModels);
        
        // If no model is selected, use the current model from the server
        if (!selectedModel && availableModels.current) {
          onModelChange(availableModels.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
        console.error('Error fetching models:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [selectedModel, onModelChange]);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    minWidth: '200px',
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const selectStyles = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.default,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: theme.effects.transition.normal,
    opacity: disabled ? 0.6 : 1,
    '&:focus': {
      borderColor: error ? theme.colors.status.error : theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${error ? theme.colors.status.error : theme.colors.primary.main}33`,
    },
  };

  const loadingStyles = {
    padding: '0.5rem 0.75rem',
    color: theme.colors.text.disabled,
    fontSize: theme.typography.fontSize.sm,
    fontStyle: 'italic',
  };

  const errorStyles = {
    padding: '0.5rem 0.75rem',
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
    backgroundColor: theme.colors.status.error + '10',
    borderRadius: theme.effects.borderRadius.sm,
    border: `1px solid ${theme.colors.status.error}40`,
  };

  const modelInfoStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: '0.25rem',
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  if (isLoading) {
    return (
      <div style={containerStyles} className={className}>
        <label style={labelStyles}>Model</label>
        <div style={loadingStyles}>
          Loading models...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles} className={className}>
        <label style={labelStyles}>Model</label>
        <div style={errorStyles}>
          {error}
        </div>
      </div>
    );
  }

  if (!models || models.available.length === 0) {
    return (
      <div style={containerStyles} className={className}>
        <label style={labelStyles}>Model</label>
        <div style={errorStyles}>
          No models available
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles} className={className}>
      <label style={labelStyles}>
        Model
        {models.current && selectedModel === models.current && (
          <span style={{ color: theme.colors.status.success, marginLeft: '0.5rem' }}>
            (Current)
          </span>
        )}
      </label>
      
      <select
        value={selectedModel}
        onChange={handleChange}
        disabled={disabled}
        style={selectStyles}
      >
        {models.available.map((model) => (
          <option key={model} value={model}>
            {model}
            {model === models.current ? ' (Current)' : ''}
          </option>
        ))}
      </select>
      
      {models && (
        <div style={modelInfoStyles}>
          {models.count} model{models.count !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
