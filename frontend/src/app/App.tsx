import { Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage/LoginPage';
import NotFoundPage from '@/features/system/NotFoundPage/NotFoundPage';
import SubmitShiftModal from '@/features/employee/SubmitShiftModal/SubmitShiftModal';
import AddVenueModal from '@/features/owner/OwnerVenuesPage/AddVenueModal';
import { useAuth } from '@/api/auth';
import { useAppState } from './AppStateProvider';
import DashboardLayout from './layouts/DashboardLayout';
import RequireRole from './RequireRole';
import { useDashboardRoutes } from './routes';
import { ROLE_HOME } from './paths';

export default function App() {
  const navigate = useNavigate();
  const app = useAppState();
  const { user } = useAuth();
  const dashboardRoutes = useDashboardRoutes();

  const loginScreen = user ? (
    <Navigate to={ROLE_HOME[user.role]} replace />
  ) : (
    <LoginPage onLoginSuccess={(role) => navigate(ROLE_HOME[role])} />
  );

  return (
    <>
      <Routes>
        <Route path="/" element={loginScreen} />
        <Route path="/login" element={loginScreen} />

        <Route element={<RequireRole />}>
          <Route element={<DashboardLayout />}>
            {dashboardRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {user?.role === 'employee' && (
        <SubmitShiftModal
          isOpen={app.isSubmitShiftOpen}
          onClose={() => app.setSubmitShiftOpen(false)}
        />
      )}
      {user?.role === 'owner' && (
        <AddVenueModal isOpen={app.isAddVenueOpen} onClose={() => app.setAddVenueOpen(false)} />
      )}
    </>
  );
}
