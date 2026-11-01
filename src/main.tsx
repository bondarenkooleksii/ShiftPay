import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { AppStateProvider } from './app/AppStateProvider';
import { AuthProvider } from './api/auth';
import './shared/styles/global.css';

async function enableMocking() {
  if (import.meta.env.VITE_API_URL) return;
  const { worker } = await import('./mocks/server/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
