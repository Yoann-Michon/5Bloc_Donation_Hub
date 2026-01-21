import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import theme from './theme';
import { ToastProvider } from './context/ToastContext';
import { RoleProvider } from './context/RoleContext';
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
const Admin = lazy(() => import('./pages/Admin'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const ProjectForm = lazy(() => import('./pages/ProjectForm'));
const ApplyAssociation = lazy(() => import('./pages/ApplyAssociation'));
const AssociationRequests = lazy(() => import('./pages/admin/AssociationRequests'));
const ProjectVote = lazy(() => import('./pages/ProjectVote'));
const ProjectVotes = lazy(() => import('./pages/ProjectVotes'));

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
        <RoleProvider>
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
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin/projects/new"
                    element={
                      <ProtectedRoute>
                        <ProjectForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin/projects/:id/edit"
                    element={
                      <ProtectedRoute>
                        <ProjectForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/association/projects"
                    element={
                      <ProtectedRoute>
                        <MyProjects />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/association/projects/new"
                    element={
                      <ProtectedRoute>
                        <ProjectForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/association/projects/:id/edit"
                    element={
                      <ProtectedRoute>
                        <ProjectForm />
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
                    path="/dashboard/governance/apply-association"
                    element={
                      <ProtectedRoute>
                        <ApplyAssociation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/governance/admin/association-requests"
                    element={
                      <ProtectedRoute>
                        <AssociationRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/governance/project/:id/vote"
                    element={
                      <ProtectedRoute>
                        <ProjectVote />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/governance/project-votes"
                    element={
                      <ProtectedRoute>
                        <ProjectVotes />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </RoleProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
