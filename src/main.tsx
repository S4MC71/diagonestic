import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ModuleProvider } from './components/ModuleGuard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <ModuleProvider>
          <App />
        </ModuleProvider>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);
