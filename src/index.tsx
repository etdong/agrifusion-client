import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import initGame from './init_game.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  </StrictMode>,
)

initGame()