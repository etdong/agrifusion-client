import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './src/pages/App.tsx'
import Title from './src/pages/Title.tsx'
import Signup from './src/pages/Signup.tsx'
import initKaplay from './src/init_kaplay.tsx'

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

