import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';
import Button from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
    },
    shadow: {
      control: { type: 'boolean' },
    },
    clickable: {
      control: { type: 'boolean' },
    },
    children: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a basic card with some content.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This card has a title and some content below it.',
  },
};

export const WithoutShadow: Story = {
  args: {
    title: 'No Shadow Card',
    children: 'This card has no shadow.',
    shadow: false,
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    children: 'This card is clickable and will show a hover effect.',
    clickable: true,
  },
};

export const WithButton: Story = {
  render: () => (
    <Card title="Card with Button">
      <p className="text-gray-600 mb-4">
        This card contains a button and some text content.
      </p>
      <Button>Click Me</Button>
    </Card>
  ),
};

export const Complex: Story = {
  render: () => (
    <Card title="User Profile" clickable>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          JD
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">John Doe</h4>
          <p className="text-sm text-gray-500">john.doe@example.com</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button size="sm" variant="primary">Edit</Button>
        <Button size="sm" variant="outline">View</Button>
      </div>
    </Card>
  ),
};