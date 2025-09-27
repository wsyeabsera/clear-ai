import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableColumn } from './Table';
import { ThemeProvider } from '../themes/ThemeProvider';

// Sample data for stories
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    avatar: '👤'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-14',
    avatar: '👩'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Moderator',
    status: 'inactive',
    lastLogin: '2024-01-10',
    avatar: '👨'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-16',
    avatar: '👩‍💼'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2024-01-08',
    avatar: '👨‍💻'
  }
];

const columns: TableColumn<User>[] = [
  {
    key: 'avatar',
    title: '',
    dataIndex: 'avatar',
    width: 60,
    align: 'center',
    render: (avatar) => <span style={{ fontSize: '1.5rem' }}>{avatar}</span>
  },
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
    render: (name, record) => (
      <div>
        <div style={{ fontWeight: '600' }}>{name}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--table-text-secondary)' }}>{record.email}</div>
      </div>
    )
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    sortable: true,
    render: (role) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)'
      }}>
        {role}
      </span>
    )
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sortable: true,
    align: 'center',
    render: (status) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: status === 'active' ? 'var(--color-status-success)' : 'var(--color-status-warning)',
        color: 'white'
      }}>
        {status}
      </span>
    )
  },
  {
    key: 'lastLogin',
    title: 'Last Login',
    dataIndex: 'lastLogin',
    sortable: true,
    align: 'right'
  }
];

const meta: Meta<typeof Table<User>> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '2rem', minHeight: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    bordered: {
      control: { type: 'boolean' },
    },
    striped: {
      control: { type: 'boolean' },
    },
    hoverable: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

export const Default: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'large',
  },
};

export const Unbordered: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: false,
    striped: true,
    hoverable: true,
    size: 'medium',
  },
};

export const NoStripes: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: false,
    hoverable: true,
    size: 'medium',
  },
};

export const NoHover: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: false,
    size: 'medium',
  },
};

export const Loading: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'medium',
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    dataSource: [],
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'medium',
    emptyText: 'No users found',
  },
};

export const WithRowClick: Story = {
  args: {
    columns,
    dataSource: sampleUsers,
    bordered: true,
    striped: true,
    hoverable: true,
    size: 'medium',
    onRowClick: (record, index) => {
      alert(`Clicked on ${record.name} (row ${index + 1})`);
    },
  },
};