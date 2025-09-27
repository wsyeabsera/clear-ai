import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    placeholder: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    required: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    error: {
      control: { type: 'text' },
    },
    helpText: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    type: 'password',
    required: true,
    placeholder: 'Enter your password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    error: 'Username is required',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter phone number',
    helpText: 'Include country code (e.g., +1)',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Disabled value',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-80">
        <Input
          label="Controlled Input"
          value={value}
          onChange={setValue}
          placeholder="Type something..."
        />
        <p className="mt-2 text-sm text-gray-600">
          Current value: {value}
        </p>
      </div>
    );
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Text Input"
        type="text"
        placeholder="Enter text"
      />
      <Input
        label="Email Input"
        type="email"
        placeholder="Enter email"
      />
      <Input
        label="Password Input"
        type="password"
        placeholder="Enter password"
      />
      <Input
        label="Number Input"
        type="number"
        placeholder="Enter number"
      />
      <Input
        label="Phone Input"
        type="tel"
        placeholder="Enter phone"
      />
      <Input
        label="URL Input"
        type="url"
        placeholder="Enter URL"
      />
    </div>
  ),
};