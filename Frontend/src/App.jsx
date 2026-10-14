import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt session restoration on initial app load via httpOnly cookie
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFFFFF',
            color: '#17211B',
            fontSize: '13px',
            borderRadius: '10px',
            border: '1px solid #E2EAE4',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
