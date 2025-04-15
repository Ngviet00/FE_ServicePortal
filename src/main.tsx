// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import './index.css'
import App from './App.tsx'
import './i18n/i18n.ts';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <App />
        <ToastContainer />
    </BrowserRouter>
)
