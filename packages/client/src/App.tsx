import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Users } from './pages/Users'
import Components from './pages/Components'
import { ThemeProvider } from './themes'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/users" element={<Users />} />
          <Route path="/components" element={<Components />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
