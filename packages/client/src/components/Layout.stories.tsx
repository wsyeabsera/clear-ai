import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { Button, Card } from './index';

const meta: Meta<typeof Layout> = {
  title: 'Layout/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Clear AI</h1>
        <p className="text-lg text-gray-600">
          This is the main content area of the application.
        </p>
        <div className="flex space-x-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    ),
  },
};

export const WithCards: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Users" clickable>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </Card>
          <Card title="Revenue" clickable>
            <p className="text-3xl font-bold text-green-600">$45,678</p>
            <p className="text-sm text-gray-500">+8% from last month</p>
          </Card>
          <Card title="Active Sessions" clickable>
            <p className="text-3xl font-bold text-purple-600">567</p>
            <p className="text-sm text-gray-500">+3% from last hour</p>
          </Card>
        </div>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <Card title="Send us a message">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button>Send Message</Button>
            </div>
          </form>
        </Card>
      </div>
    ),
  },
};

export const Empty: Story = {
  args: {
    children: (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Content</h1>
        <p className="text-gray-600 mb-8">This is an empty page example.</p>
        <Button>Add Content</Button>
      </div>
    ),
  },
};
