import type { Meta, StoryObj } from '@storybook/react';
import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
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

const sampleJson = {
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "gaming"]
};

const sampleArray = [
  "item1",
  "item2", 
  "item3"
];

export const Default: Story = {
  args: {
    label: 'Description',
    value: '',
    placeholder: 'Enter your description here...',
    rows: 4,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Description',
    value: 'This is a sample text area with some content. It can contain multiple lines of text and will automatically resize based on the content.',
    placeholder: 'Enter your description here...',
    rows: 4,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    value: '',
    placeholder: 'This field is required',
    required: true,
    rows: 3,
  },
};

export const WithError: Story = {
  args: {
    label: 'Field with Error',
    value: 'Invalid content',
    placeholder: 'Enter valid content',
    error: 'This field contains invalid data',
    rows: 3,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'This field is disabled and cannot be edited',
    placeholder: 'This field is disabled',
    disabled: true,
    rows: 3,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Field',
    value: 'This field is read-only and cannot be edited',
    placeholder: 'This field is read-only',
    readOnly: true,
    rows: 3,
  },
};

export const JSONObject: Story = {
  args: {
    label: 'JSON Object',
    value: JSON.stringify(sampleJson, null, 2),
    placeholder: 'Enter JSON object here...',
    rows: 8,
  },
};

export const JSONArray: Story = {
  args: {
    label: 'JSON Array',
    value: JSON.stringify(sampleArray, null, 2),
    placeholder: 'Enter JSON array here...',
    rows: 4,
  },
};

export const LargeContent: Story = {
  args: {
    label: 'Large Content',
    value: `This is a very long text area with multiple lines of content.
    
It demonstrates how the textarea handles:
- Multiple lines
- Long paragraphs
- Various formatting
- And more content that might overflow

The textarea should handle this gracefully and provide scrolling when needed.`,
    placeholder: 'Enter large content here...',
    rows: 6,
    minRows: 4,
    maxRows: 10,
  },
};

export const SmallRows: Story = {
  args: {
    label: 'Small TextArea',
    value: 'Short content',
    placeholder: 'Enter short content',
    rows: 2,
    minRows: 2,
    maxRows: 4,
  },
};
