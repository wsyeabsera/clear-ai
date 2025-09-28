import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { DynamicForm } from '../components/DynamicForm';
import Button from '../components/Button';
import Select from '../components/Select';
import { toolService, ToolSchema } from '../services/toolService';
import { TextArea } from '../components';
import { useTheme } from '../themes';

export const ToolExecute: React.FC = () => {
  const [schemas, setSchemas] = useState<ToolSchema[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [currentSchema, setCurrentSchema] = useState<ToolSchema | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading tool schemas...');
      const response = await toolService.getToolSchemas();
      console.log('Tool schemas response:', response);
      
      if (response.success && response.data) {
        console.log('Setting schemas:', response.data);
        setSchemas(response.data);
        if (response.data.length > 0) {
          setSelectedTool(response.data[0].name);
          setCurrentSchema(response.data[0]);
        }
      } else {
        console.error('Failed to load schemas:', response.error);
        setError(response.error || 'Failed to load tool schemas');
      }
    } catch (err: any) {
      console.error('Error loading schemas:', err);
      setError(err.message || 'Failed to load tool schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    const schema = schemas.find(s => s.name === toolName);
    setCurrentSchema(schema || null);
    setExecutionResult(null);
    setError('');
  };

  const handleExecute = async (formData: Record<string, any>) => {
    if (!selectedTool) return;

    try {
      setLoading(true);
      setError('');
      setExecutionResult(null);

      const response = await toolService.executeTool(selectedTool, formData);
      
      if (response.success) {
        setExecutionResult(response.data);
      } else {
        setError(response.error || 'Tool execution failed');
      }
    } catch (err: any) {
      setError(err.message || 'Tool execution failed');
    } finally {
      setLoading(false);
    }
  };

  const formatJsonOutput = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const { theme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ color: theme.colors.text.primary }}
          >Tool Execute</h1>
          <p
          className="text-gray-600"
          style={{ color: theme.colors.text.secondary }}
          >
            Select a tool and fill out the form to execute it. View the results below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tool Selection and Form */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tool Selection</h2>
                
                {loading && schemas.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p
                    className="mt-2 text-gray-600"
                    style={{ color: theme.colors.text.secondary }}
                    >Loading tools...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select
                      label="Select Tool"
                      value={selectedTool}
                      onChange={handleToolChange}
                      options={schemas.map((schema) => ({
                        value: schema.name,
                        label: `${schema.name} - ${schema.description}`,
                      }))}
                      placeholder="Choose a tool to execute"
                    />

                    {currentSchema && (
                      <div>
                        <h3
                        className="text-lg font-medium mb-3"
                        style={{ color: theme.colors.text.primary }}
                        >Tool Parameters</h3>
                        <DynamicForm
                          schema={currentSchema.inputSchema}
                          onSubmit={handleExecute}
                          loading={loading}
                        />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p
                    className="text-red-800 text-sm"
                    style={{ color: theme.colors.text.primary }}
                    >{error}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                  className="text-xl font-semibold"
                  style={{ color: theme.colors.text.primary }}
                  >Execution Results</h2>
                  {executionResult && (
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(formatJsonOutput(executionResult));
                      }}
                      className="px-3 py-1 text-sm"
                    >
                      Copy JSON
                    </Button>
                  )}
                </div>

                {executionResult ? (
                  <div className="space-y-4">
                    <div className="rounded-md p-4">
                      <h3
                      className="text-sm font-medium text-gray-700 mb-2"
                      style={{ color: theme.colors.text.primary }}
                      >Raw Output:</h3>
                      <TextArea
                        label="Raw Output"
                        value={formatJsonOutput(executionResult)}
                        onChange={() => {}}
                        rows={10}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500"
                  style={{ color: theme.colors.text.secondary }}
                  >
                    <p>Execute a tool to see results here</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Tool Schema Information */}
            {currentSchema && (
              <Card>
                <div className="p-6">
                  <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: theme.colors.text.primary }}
                  >Tool Schema</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3
                      className="text-sm font-medium text-gray-700 mb-2"
                      style={{ color: theme.colors.text.primary }}
                      >Input Schema:</h3>
                      <TextArea
                        label="Input Schema"
                        value={JSON.stringify(currentSchema.inputSchema, null, 2)}
                        onChange={() => {}}
                        rows={10}
                      />
                    </div>

                    {currentSchema.outputSchema && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Output Schema:</h3>
                        <TextArea
                          label="Output Schema"
                          value={JSON.stringify(currentSchema.outputSchema, null, 2)}
                          onChange={() => {}}
                          rows={10}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
