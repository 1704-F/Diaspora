import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme } from '@mui/material/styles';
import './i18n/config'; // Initialize i18n
import { useAuthStore } from './stores/auth.store';
import { useTenantStore } from './stores/tenant.store';
import { useRolesStore } from './stores/roles.store';
import membersService from './services/members.service';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LanguageSelectionPage } from './pages/LanguageSelectionPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { DashboardRedirect } from './pages/DashboardRedirect';
import { SelectAssociationPage } from './pages/Associations';
import { Dashboard } from './pages/Dashboard';
import { MembersPage } from './pages/members/MembersPage';
import { EventsPage } from './pages/events/EventsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ContributionsPage } from './pages/contributions/ContributionsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#003D3D',
    },
    secondary: {
      main: '#006666',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Language Check Route - redirects to language selection if not set
const LanguageCheckRoute = ({ children }: { children: React.ReactNode }) => {
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  return selectedLanguage ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const loadMemberRoles = useRolesStore((state) => state.loadMemberRoles);

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Load roles when authenticated and has a current tenant
  useEffect(() => {
    const loadRoles = async () => {
      if (isAuthenticated && currentTenant) {
        try {
          const member = await membersService.getCurrentMember(currentTenant.id);
          await loadMemberRoles(currentTenant.id, member.id);
        } catch (error) {
          console.error('Failed to load member roles on startup:', error);
        }
      }
    };

    loadRoles();
  }, [isAuthenticated, currentTenant, loadMemberRoles]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />

        <Routes>
          {/* Language Selection - First screen */}
          <Route path="/" element={<LanguageSelectionPage />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <LanguageCheckRoute>
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              </LanguageCheckRoute>
            }
          />
          <Route
            path="/register"
            element={
              <LanguageCheckRoute>
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              </LanguageCheckRoute>
            }
          />

          {/* Onboarding - for new users */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingWizard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Redirect - intelligent routing */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Association Selection */}
          <Route
            path="/associations/select"
            element={
              <ProtectedRoute>
                <SelectAssociationPage />
              </ProtectedRoute>
            }
          />

          {/* Association-specific Routes (with tenantId) */}
          <Route
            path="/associations/:tenantId/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/associations/:tenantId/members"
            element={
              <ProtectedRoute>
                <Layout>
                  <MembersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/associations/:tenantId/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/associations/:tenantId/events"
            element={
              <ProtectedRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/associations/:tenantId/contributions"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContributionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/associations/:tenantId/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to language selection or dashboard */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/"}
                replace
              />
            }
          />
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
