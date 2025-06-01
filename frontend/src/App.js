import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { OrderProvider } from './context/OrderContext';
import ThemeToggle from './components/ui/ThemeToggle';
import AppRoutes from './routes';

// Styles
import './index.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrderProvider>
          <SocketProvider>
            <NotificationProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
                  <AppRoutes />
                  <ThemeToggle />
                  <Toaster
                    position="bottom-right"
                    reverseOrder={false}
                    gutter={8}
                    containerClassName="z-50"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--toast-bg)',
                        color: 'var(--toast-color)',
                        border: '1px solid var(--toast-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        boxShadow: 'var(--toast-shadow)',
                      },
                      success: {
                        iconTheme: {
                          primary: '#10b981',
                          secondary: 'var(--toast-bg)',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: 'var(--toast-bg)',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </NotificationProvider>
          </SocketProvider>
        </OrderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 