import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <UserDataProvider>
            <App />
          </UserDataProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
