import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeDropdown from './ThemeDropdown'
import { useTheme } from '../themes'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme } = useTheme()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const getNavStyle = () => {
    return {
      backgroundColor: `${theme.colors.background.paper}E6`, // 90% opacity
      backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${theme.colors.border.default}`,
    }
  }

  const getMainStyle = () => {
    return {
      backgroundColor: `${theme.colors.background.paper}66`, // 40% opacity
      backdropFilter: 'blur(8px)',
    }
  }

  return (
    <div className="min-h-screen h-full relative z-10" style={{ background: 'transparent' }}>
      <nav className="shadow-sm relative z-50" style={getNavStyle()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  to="/" 
                  className="text-xl font-bold"
                  style={{ color: theme.colors.primary.main }}
                >
                  Clear AI
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Home
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/chat') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/chat') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Chat
                </Link>
                <Link
                  to="/available-tools"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/available-tools') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/available-tools') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Available Tools
                </Link>
                <Link
                  to="/tool-execute"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/tool-execute') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/tool-execute') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Tool Execute
                </Link>
                <Link
                  to="/users"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/users') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/users') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Users
                </Link>
                <Link
                  to="/components"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderBottomColor: isActive('/components') ? theme.colors.primary.main : 'transparent',
                    color: isActive('/components') ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  Components
                </Link>
              </div>
            </div>
            
            {/* Theme Dropdown */}
            <div className="flex items-center">
              <ThemeDropdown 
                size="sm" 
                showLabels={true}
                className="hidden sm:block"
              />
            </div>
          </div>
          
          {/* Mobile Theme Dropdown */}
          <div className="sm:hidden px-4 py-3 border-t border-gray-200">
            <div className="flex justify-center">
              <ThemeDropdown 
                size="sm" 
                showLabels={true}
              />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 relative z-40" style={getMainStyle()}>
        <div className="w-full h-fit">
          {children}
        </div>
      </main>
    </div>
  )
}
