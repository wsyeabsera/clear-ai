import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { AvailableTools } from './pages/AvailableTools'
import { Users } from './pages/Users'
import { ToolExecute } from './pages/ToolExecute'
import Components from './pages/Components'
import Chat from './pages/Chat'
import { ThemeProvider, useTheme } from './themes'

function AppContent() {
  const { theme } = useTheme()

  const getBackgroundStyle = () => {
    // Different background styles for each theme
    switch (theme.name) {
      case 'neowave':
        return {
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
        }
      case 'techno':
        return {
          background: `
            linear-gradient(45deg, #000000 0%, #0D1117 25%, #1A1A2E 50%, #0D1117 75%, #000000 100%),
            radial-gradient(ellipse at 20% 20%, #00E676 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, #FF5722 0%, transparent 50%)
          `,
        }
      case 'oldschool':
        return {
          background: 'linear-gradient(135deg, #F5F5DC 0%, #FAEBD7 50%, #F5F5DC 100%)',
        }
      case 'alien':
        return {
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #16213E 100%)',
        }
      default:
        return {
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
        }
    }
  }

  const getPatternStyle = () => {
    const patternColor = theme.colors.primary.main
    
    // Simplified patterns for each theme - only subtle moving background
    switch (theme.name) {
      case 'neowave':
        return {
          backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
          opacity: 0.3,
          animation: 'floating 60s ease-in-out infinite'
        }
      case 'techno':
        return {
          backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
          opacity: 0.2,
          animation: 'floating 80s ease-in-out infinite'
        }
      case 'oldschool':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
          opacity: 0.2,
          animation: 'floating 70s ease-in-out infinite'
        }
      case 'alien':
        return {
          backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
          opacity: 0.3,
          animation: 'floating 90s ease-in-out infinite'
        }
      default:
        return {
          backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
          opacity: 0.2,
          animation: 'floating 60s ease-in-out infinite'
        }
    }
  }

  return (
    <div 
      className="min-h-screen h-fit relative"
      style={getBackgroundStyle()}
    >
      <div 
        className="fixed inset-0 z-0"
        style={getPatternStyle()}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/available-tools" element={<AvailableTools />} />
          <Route path="/tool-execute" element={<ToolExecute />} />
          <Route path="/users" element={<Users />} />
          <Route path="/components" element={<Components />} />
        </Routes>
      </Layout>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
