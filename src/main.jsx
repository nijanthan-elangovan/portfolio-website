import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // This is the only CSS import you need
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)