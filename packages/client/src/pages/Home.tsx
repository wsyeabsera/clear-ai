import React from 'react'

export const Home: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Clear AI
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          A modern TypeScript monorepo with React client, Node.js server, and shared utilities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Fast Development
            </h3>
            <p className="text-blue-700">
              Hot reload, TypeScript support, and modern build tools for rapid development.
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🔧 Monorepo Structure
            </h3>
            <p className="text-green-700">
              Shared code, consistent tooling, and streamlined development workflow.
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              📦 Type Safety
            </h3>
            <p className="text-purple-700">
              End-to-end TypeScript with shared types and utilities across all packages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
