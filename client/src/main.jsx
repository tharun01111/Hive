import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { initTheme } from './utils/theme.js'

initTheme()

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #171717)',
            color: 'var(--toast-color, #f5f5f5)',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
    </BrowserRouter>
  </ErrorBoundary>
)