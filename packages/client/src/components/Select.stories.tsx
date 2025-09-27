import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'api_call', label: 'API Call - Make HTTP API calls to external services' },
  { value: 'file_reader', label: 'File Reader - Read files, list directories, or get file information' },
  { value: 'json_reader', label: 'JSON Reader - Parse and read JSON data with optional path extraction' },
];

export const Default: Story = {
  args: {
    label: 'Select Option',
    value: '',
    options,
    placeholder: 'Choose an option',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Select Option',
    value: 'option2',
    options,
    placeholder: 'Choose an option',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    value: '',
    options,
    placeholder: 'Choose an option',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Field with Error',
    value: '',
    options,
    placeholder: 'Choose an option',
    error: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'option1',
    options,
    placeholder: 'Choose an option',
    disabled: true,
  },
};

export const ToolSelection: Story = {
  args: {
    label: 'Select Tool',
    value: '',
    options: [
      { value: 'api_call', label: 'API Call - Make HTTP API calls to external services' },
      { value: 'file_reader', label: 'File Reader - Read files, list directories, or get file information' },
      { value: 'json_reader', label: 'JSON Reader - Parse and read JSON data with optional path extraction' },
    ],
    placeholder: 'Choose a tool to execute',
  },
};
