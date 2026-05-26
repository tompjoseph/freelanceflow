import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import RenewalAlert from './components/RenewalAlert';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Payments from './pages/Payments';
import Domains from './pages/Domains';
import Profile from './pages/Profile';

function Layout() {
  return (
    <>
      <Navbar />
      <RenewalAlert />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/payments" element={<Payments />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
