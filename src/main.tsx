import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './components/RootComponent/App.tsx';

import './components/RootComponent/index.css'
import './components/RootComponent/App.css'
import './i18n/i18n.ts';
import './../public/libs/quill/quill.snow.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <App />
            <ToastContainer />
        </BrowserRouter>
    </QueryClientProvider>
)
