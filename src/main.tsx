// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './components/RootComponent/index.css'
import './components/RootComponent/App.css'
import './i18n/i18n.ts';
import { ToastContainer } from 'react-toastify';

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import App from './components/RootComponent/App.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <App />
            <ToastContainer />
        </BrowserRouter>
    </QueryClientProvider>
)
