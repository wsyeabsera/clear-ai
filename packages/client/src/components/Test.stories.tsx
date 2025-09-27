import type { Meta, StoryObj } from '@storybook/react';

const TestComponent = () => {
  return <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>Test Component</div>;
};

const meta: Meta<typeof TestComponent> = {
  title: 'Test/TestComponent',
  component: TestComponent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
