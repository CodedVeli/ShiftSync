import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Availability from './pages/Availability';
import SwapRequests from './pages/SwapRequests';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Notifications from './pages/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
            <Route path="/swap-requests" element={<ProtectedRoute><SwapRequests /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requiredRole="MANAGER"><Analytics /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/audit-log" element={<ProtectedRoute requiredRole="MANAGER"><AuditLog /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
