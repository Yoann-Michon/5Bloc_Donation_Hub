import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import theme from './theme';
import { ToastProvider } from './context/ToastContext';
import Layout from './component/layout/Layout';
import PublicLayout from './component/layout/PublicLayout';
import ProtectedRoute from './component/auth/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectView = lazy(() => import('./pages/ProjectView'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BadgeFusion = lazy(() => import('./pages/BadgeFusion'));
const AdminWithdrawals = lazy(() => import('./pages/AdminWithdrawals'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectView />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/join-us" element={<JoinUs />} />
              </Route>

              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard/projects" element={<Projects />} />
                <Route path="/dashboard/projects/:id" element={<ProjectView />} />
                <Route
                  path="/dashboard/fusion"
                  element={
                    <ProtectedRoute>
                      <BadgeFusion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin/withdrawals"
                  element={
                    <ProtectedRoute>
                      <AdminWithdrawals />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
