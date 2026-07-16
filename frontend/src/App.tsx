import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { storage } from './lib/auth';
import { ToastProvider } from './lib/useToast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import HabitsPage from './pages/HabitsPage';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import PageTransition from './components/PageTransition';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!storage.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300">{children}</main>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (storage.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicRoute>
              <PageTransition variant="fade">
                <LandingPage />
              </PageTransition>
            </PublicRoute>
          }
        />

        {/* Auth pages */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <PageTransition variant="scale">
                <LoginPage />
              </PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicRoute>
              <PageTransition variant="scale">
                <RegisterPage />
              </PageTransition>
            </PublicRoute>
          }
        />

        {/* Protected pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition variant="fade">
                <DashboardPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <PageTransition variant="slide">
                <ExpensesPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <PageTransition variant="slide">
                <HabitsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AnimatedRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
