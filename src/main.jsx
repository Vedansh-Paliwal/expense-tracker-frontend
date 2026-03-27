import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import "./index.css"
import App from './App.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { Dashboard } from './pages/Dashboard/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  // When you write: <AuthProvider> <App  </AuthProvider>, React automatically passes <App /> as a prop called children.
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)