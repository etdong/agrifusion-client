import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import initKaplay from './init_kaplay.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  </StrictMode>,
)

initKaplay()