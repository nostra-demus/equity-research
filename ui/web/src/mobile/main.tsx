// Mobile entry. Imports tokens.css (the shared design contract) + the computed-card stylesheet (the
// shared what-if card) + mobile.css — and deliberately NOT global.css (362 KB of desktop layout) or
// the desktop store. The dependency graph of this file IS the phone's download size; keep it small.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/computed-card.css'
import './styles/mobile.css'
import { MobileApp } from './MobileApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileApp />
  </StrictMode>,
)
