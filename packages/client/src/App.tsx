import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { AvailableTools } from './pages/AvailableTools'
import { Users } from './pages/Users'
import { ToolExecute } from './pages/ToolExecute'
import Components from './pages/Components'
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
    
    // Different patterns for each theme
    switch (theme.name) {
      case 'neowave':
        return {
          backgroundImage: `
            radial-gradient(circle, ${patternColor} 2px, transparent 2px),
            radial-gradient(circle at 25% 25%, ${theme.colors.secondary.main} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${theme.colors.primary.main} 1px, transparent 1px),
            conic-gradient(from 0deg, ${theme.colors.primary.main} 0deg, transparent 60deg, ${theme.colors.secondary.main} 120deg, transparent 180deg)
          `,
          backgroundSize: '30px 30px, 60px 60px, 90px 90px, 120px 120px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
          backgroundRepeat: 'repeat, repeat, repeat, repeat',
          opacity: 0.6,
          animation: 'floating 40s ease-in-out infinite, morphing 60s ease-in-out infinite, rotating 80s linear infinite'
        }
      case 'techno':
        return {
          backgroundImage: `
            linear-gradient(${patternColor} 1px, transparent 1px), 
            linear-gradient(90deg, ${patternColor} 1px, transparent 1px),
            radial-gradient(circle at 25% 25%, ${theme.colors.secondary.main} 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, ${theme.colors.primary.main} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 40px 40px, 60px 60px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
          backgroundRepeat: 'repeat, repeat, repeat, repeat',
          opacity: 0.7,
          animation: 'matrix 30s linear infinite, disco 45s ease-in-out infinite, pulse 20s ease-in-out infinite'
        }
      case 'oldschool':
        return {
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 8px, ${patternColor} 8px, ${patternColor} 9px),
            repeating-linear-gradient(-45deg, transparent, transparent 12px, ${theme.colors.secondary.main} 12px, ${theme.colors.secondary.main} 13px),
            radial-gradient(circle at 20% 80%, ${theme.colors.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, ${theme.colors.secondary.main} 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px, 40px 40px, 60px 60px, 80px 80px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
          backgroundRepeat: 'repeat, repeat, repeat, repeat',
          opacity: 0.4,
          animation: 'vintage 35s ease-in-out infinite, elegant 50s ease-in-out infinite, antique 70s ease-in-out infinite'
        }
      case 'alien':
        return {
          backgroundImage: `
            linear-gradient(30deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}),
            linear-gradient(150deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}),
            radial-gradient(ellipse at 20% 20%, ${theme.colors.secondary.main} 2px, transparent 2px),
            radial-gradient(ellipse at 80% 80%, ${theme.colors.primary.main} 2px, transparent 2px),
            conic-gradient(from 0deg, ${theme.colors.primary.main} 0deg, ${theme.colors.secondary.main} 60deg, ${theme.colors.primary.main} 120deg, ${theme.colors.secondary.main} 180deg, ${theme.colors.primary.main} 240deg, ${theme.colors.secondary.main} 300deg, ${theme.colors.primary.main} 360deg)
          `,
          backgroundSize: '35px 35px, 35px 35px, 50px 50px, 70px 70px, 100px 100px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0',
          backgroundRepeat: 'repeat, repeat, repeat, repeat, repeat',
          opacity: 0.7,
          animation: 'morphing 45s ease-in-out infinite, cosmic 60s ease-in-out infinite, quantum 90s linear infinite, alien 55s ease-in-out infinite'
        }
      default:
        return {
          backgroundImage: `
            radial-gradient(circle, ${patternColor} 3px, transparent 3px),
            radial-gradient(circle at 30% 30%, ${theme.colors.secondary.main} 2px, transparent 2px),
            radial-gradient(circle at 70% 70%, ${theme.colors.primary.main} 1px, transparent 1px),
            linear-gradient(45deg, transparent 48%, ${theme.colors.primary.main} 49%, ${theme.colors.primary.main} 51%, transparent 52%)
          `,
          backgroundSize: '40px 40px, 60px 60px, 80px 80px, 100px 100px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
          backgroundRepeat: 'repeat, repeat, repeat, repeat',
          opacity: 0.8,
          animation: 'floating 35s ease-in-out infinite, pulse 50s ease-in-out infinite, slide 65s ease-in-out infinite'
        }
    }
  }

  return (
    <div 
      className="min-h-screen relative"
      style={getBackgroundStyle()}
    >
      <div 
        className="fixed inset-0 z-0"
        style={getPatternStyle()}
      />
      {/* Additional pattern layer for some themes */}
      {theme.name === 'techno' && (
        <>
          {/* Disco ball effect */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `conic-gradient(from 0deg, ${theme.colors.primary.main} 0deg, ${theme.colors.secondary.main} 60deg, ${theme.colors.primary.main} 120deg, ${theme.colors.secondary.main} 180deg, ${theme.colors.primary.main} 240deg, ${theme.colors.secondary.main} 300deg, ${theme.colors.primary.main} 360deg)`,
              backgroundSize: '80px 80px',
              backgroundPosition: '0 0',
              backgroundRepeat: 'repeat',
              opacity: 0.3,
              animation: 'disco 60s linear infinite'
            }}
          />
          {/* Moving laser lines */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(45deg, transparent 48%, ${theme.colors.primary.main} 49%, ${theme.colors.primary.main} 51%, transparent 52%)`,
              backgroundSize: '100px 100px',
              backgroundPosition: '0 0',
              backgroundRepeat: 'repeat',
              opacity: 0.4,
              animation: 'laser 40s linear infinite'
            }}
          />
          {/* Pulsing circles */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `radial-gradient(circle, ${theme.colors.secondary.main} 3px, transparent 3px)`,
              backgroundSize: '120px 120px',
              backgroundPosition: '0 0',
              backgroundRepeat: 'repeat',
              opacity: 0.5,
              animation: 'pulse 25s ease-in-out infinite'
            }}
          />
          {/* Scanning lines */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 95%, ${theme.colors.primary.main} 96%, ${theme.colors.primary.main} 97%, transparent 98%)`,
              backgroundSize: '200px 200px',
              backgroundPosition: '0 0',
              backgroundRepeat: 'repeat',
              opacity: 0.6,
              animation: 'scan 50s linear infinite'
            }}
          />
        </>
      )}
      {theme.name === 'neowave' && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `conic-gradient(from 0deg, ${theme.colors.secondary.main} 0deg, transparent 60deg, ${theme.colors.primary.main} 120deg, transparent 180deg)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            opacity: 0.1,
            animation: 'rotating 40s linear infinite'
          }}
        />
      )}
      {theme.name === 'alien' && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 20%, ${theme.colors.secondary.main} 1px, transparent 1px), radial-gradient(ellipse at 80% 80%, ${theme.colors.primary.main} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            opacity: 0.3,
            animation: 'cosmic 35s ease-in-out infinite'
          }}
        />
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
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
