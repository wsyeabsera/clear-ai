import React, { useState, useEffect } from 'react'
import { toolService, ToolInfo } from '../services/toolService'
import { Table, TableColumn } from '../components/Table'
import Button from '../components/Button'
import { useTheme } from '../themes';

export const AvailableTools: React.FC = () => {
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define table columns
  const columns: TableColumn<ToolInfo>[] = [
    {
      key: 'name',
      title: 'Tool Name',
      dataIndex: 'name',
      width: '30%',
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      width: '70%',
      render: (value: string) => (
        <span className="">{value}</span>
      ),
    },
  ]

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        setError(null)
        const tools = await toolService.getTools()
        console.log('Tools:', tools)
        setTools(tools)
      } catch (err) {
        setError('An unexpected error occurred')
        console.error('Error fetching tools:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const handleRefresh = () => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        setError(null)
        const tools = await toolService.getTools()
        setTools(tools)
      } catch (err) {
        setError('An unexpected error occurred')
        console.error('Error fetching tools:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }

  const { theme } = useTheme();

  return (
    <div className="bg-inherit overflow-hidden shadow rounded-lg"
      style={{ backgroundColor: theme.colors.background.default }}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold"
            style={{ color: theme.colors.text.primary }}
          >
            Tool List
          </h1>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="primary"
            size="md"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800"
                  style={{ color: theme.colors.text.primary }}
                >
                  Error loading tools
                </h3>
                <div className="mt-2 text-sm text-red-700"
                  style={{ color: theme.colors.text.primary }}
                >
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <div className="space-y-4">
            <p className="text-lg text-gray-600 mb-6"
              style={{ color: theme.colors.text.secondary }}
            >
              Available MCP (Model Context Protocol) tools that can be executed through the API.
            </p>

            <Table
              columns={columns}
              dataSource={tools}
              loading={loading}
              emptyText="No tools available"
              bordered={true}
              striped={true}
              hoverable={true}
              size="medium"
              className="w-full"
            />

            <div className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.background.paper }}
            >
              <h4 className="text-sm font-medium mb-2"
                style={{ color: theme.colors.text.primary }}
              >API Information</h4>
              <p className="text-sm"
                style={{ color: theme.colors.text.secondary }}
              >
                These tools can be executed via the <code className="bg-inherit px-1 rounded">/api/mcp/execute</code> endpoint.
                Use the tool name and provide the required arguments to execute any tool.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
