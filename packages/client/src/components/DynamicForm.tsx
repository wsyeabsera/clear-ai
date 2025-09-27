import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import TextArea from './TextArea';
interface DynamicFormProps {
  schema: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form data with default values
    const initialData: Record<string, any> = {};
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.default !== undefined) {
          initialData[key] = prop.default;
        } else if (prop.type === 'boolean') {
          initialData[key] = false;
        } else if (prop.type === 'array') {
          initialData[key] = [];
        } else if (prop.type === 'object') {
          initialData[key] = {};
        }
      });
    }
    setFormData(initialData);
  }, [schema]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateField = (field: string, value: any, prop: any): string => {
    if (prop.required && (value === undefined || value === null || value === '')) {
      return `${field} is required`;
    }

    if (prop.type === 'string' && prop.format === 'uri' && value) {
      try {
        new URL(value);
      } catch {
        return `${field} must be a valid URL`;
      }
    }

    if (prop.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field} must be a valid number`;
      }
      if (prop.minimum !== undefined && numValue < prop.minimum) {
        return `${field} must be at least ${prop.minimum}`;
      }
      if (prop.maximum !== undefined && numValue > prop.maximum) {
        return `${field} must be at most ${prop.maximum}`;
      }
    }

    if (prop.enum && value && !prop.enum.includes(value)) {
      return `${field} must be one of: ${prop.enum.join(', ')}`;
    }

    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        const error = validateField(key, formData[key], prop);
        if (error) {
          newErrors[key] = error;
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: string, prop: any) => {
    const value = formData[field] || '';
    const error = errors[field];
    const isRequired = schema?.required?.includes(field) || false;

    if (prop.type === 'boolean') {
      return (
        <div key={field} className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(field, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {field} {isRequired && <span className="text-red-500">*</span>}
            </span>
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (prop.enum) {
      const options = prop.enum.map((option: any) => ({
        value: option,
        label: option,
      }));

      return (
        <Select
          key={field}
          label={field}
          value={value}
          onChange={(newValue) => handleInputChange(field, newValue)}
          options={options}
          placeholder={`Select ${field}`}
          required={isRequired}
          error={error}
        />
      );
    }

    if (prop.type === 'object') {
      return (
        <TextArea
          key={field}
          label={field}
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(newValue) => {
            try {
              const parsed = JSON.parse(newValue);
              handleInputChange(field, parsed);
            } catch {
              handleInputChange(field, newValue);
            }
          }}
          placeholder={`Enter ${field} as JSON`}
          rows={4}
          required={isRequired}
          error={error}
        />
      );
    }

    if (prop.type === 'array') {
      return (
        <TextArea
          key={field}
          label={field}
          value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''}
          onChange={(newValue) => {
            try {
              const parsed = JSON.parse(newValue);
              if (Array.isArray(parsed)) {
                handleInputChange(field, parsed);
              }
            } catch {
              // Keep as string for now
            }
          }}
          placeholder={`Enter ${field} as JSON array`}
          rows={3}
          required={isRequired}
          error={error}
        />
      );
    }

    // Default to text input
    return (
      <div key={field} className="mb-4">
        <Input
          label={field}
          type={prop.format === 'uri' ? 'url' : prop.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(value: string) => handleInputChange(field, value)}
          required={isRequired}
          error={error}
          placeholder={prop.description || `Enter ${field}`}
        />
      </div>
    );
  };

  if (!schema?.properties) {
    return (
      <div className="text-center text-gray-500 py-8">
        No form schema available
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(schema.properties).map(([field, prop]: [string, any]) => 
          renderField(field, prop)
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 py-2"
        >
          {loading ? 'Executing...' : 'Execute Tool'}
        </Button>
      </div>
    </form>
  );
};
