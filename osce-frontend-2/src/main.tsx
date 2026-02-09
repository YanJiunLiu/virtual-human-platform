import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppUser from './pages/user' 
import AppAmin from './pages/admin'

const entry = import.meta.env.VITE_ENTRY;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {
      entry === 'user' ?
        <AppUser /> :
        <AppAmin />
    }
  </StrictMode>,
)
