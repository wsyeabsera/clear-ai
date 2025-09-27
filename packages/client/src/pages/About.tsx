import React from 'react'

export const About: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          About Clear AI
        </h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Clear AI is a comprehensive TypeScript monorepo designed for modern web applications.
            It provides a solid foundation for building scalable applications with shared code,
            type safety, and efficient development workflows.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Architecture</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li><strong>Shared Package:</strong> Common types, utilities, and constants</li>
            <li><strong>Client Package:</strong> React frontend with Vite and TypeScript</li>
            <li><strong>Server Package:</strong> Node.js backend with Express and TypeScript</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>TypeScript for type safety across the entire stack</li>
            <li>Turbo for efficient monorepo management</li>
            <li>Hot reload for fast development</li>
            <li>Modern build tools and linting</li>
            <li>Workspace dependencies for shared code</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
