import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateUser from './pages/CreateUser';
import UpdateData from './pages/UpdateData';
import Accounts from './pages/Accounts';
import Payments from './pages/Payments';
import RequestPayment from './pages/RequestPayment';
import Wallets from './pages/Wallets';
import GenerateRights from './pages/GenerateRights';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/update-data" element={<PrivateRoute><UpdateData /></PrivateRoute>} />
      <Route path="/request-payment" element={<PrivateRoute><RequestPayment /></PrivateRoute>} />
      <Route path="/wallets" element={<PrivateRoute><Wallets /></PrivateRoute>} />
      <Route path="/create-user" element={<AdminRoute><CreateUser /></AdminRoute>} />
      <Route path="/accounts" element={<AdminRoute><Accounts /></AdminRoute>} />
      <Route path="/payments" element={<AdminRoute><Payments /></AdminRoute>} />
      <Route path="/generate-rights" element={<AdminRoute><GenerateRights /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
