import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './pages/App.tsx'
import Title from './pages/Title.tsx'
import Signup from './pages/Signup.tsx'
import initKaplay from './init_kaplay.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <Routes>
                <Route path='/' element={<Title />}/>
                <Route path='/play' element={<App />}/>
                <Route path='/signup' element={<Signup />}/>
            </Routes>
        </HashRouter>   
    </StrictMode>,
)

initKaplay()

