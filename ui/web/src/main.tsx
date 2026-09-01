import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './App'
import { startBrowserPerformanceMonitoring } from './lib/performance'

startBrowserPerformanceMonitoring()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
