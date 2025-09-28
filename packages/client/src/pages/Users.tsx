import React, { useState, useEffect } from 'react'
import { User } from '@clear-ai/shared'
import { userService } from '../services/userService'
import { Table, TableColumn } from '../components/Table'
import { useTheme } from '../themes';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortInfo, setSortInfo] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>(undefined)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const users = await userService.getUsers()
        setUsers(users)
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortInfo({ key, direction })
    // In a real app, you might want to sort the data here or make an API call
    const sortedUsers = [...users].sort((a, b) => {
      const aValue = a[key as keyof User]
      const bValue = b[key as keyof User]
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
    setUsers(sortedUsers)
  }

  const { theme } = useTheme();

  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '80px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true,
      width: '120px',
    },
  ]

  if (error) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg"
      style={{ backgroundColor: theme.colors.background.default }}
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800"
            style={{ color: theme.colors.text.primary }}
            >{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-inherit overflow-hidden shadow rounded-lg"
    style={{ backgroundColor: theme.colors.background.default }}
    >
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-3xl font-bold mb-6"
        style={{ color: theme.colors.text.primary }}
        >
          Users
        </h1>
        
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          bordered={true}
          striped={true}
          hoverable={true}
          size="medium"
          onSort={handleSort}
          sortInfo={sortInfo}
          emptyText="No users found"
          className="w-full"
        />
      </div>
    </div>
  )
}
