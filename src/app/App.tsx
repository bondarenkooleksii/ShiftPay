import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage/LoginPage';
import NotFoundPage from '@/features/system/NotFoundPage/NotFoundPage';
import SubmitShiftModal from '@/features/employee/SubmitShiftModal/SubmitShiftModal';
import AddVenueModal from '@/features/owner/OwnerVenuesPage/AddVenueModal';
import { useAppState } from './AppStateProvider';
import DashboardLayout from './layouts/DashboardLayout';
import CanvasView from './dev/CanvasView';
import DevToolbar from './dev/DevToolbar';
import { useDashboardRoutes } from './routes';
import { ROLE_HOME } from './paths';

export default function App() {
  const navigate = useNavigate();
  const app = useAppState();
  const dashboardRoutes = useDashboardRoutes();

  const loginScreen = (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <LoginPage onLoginSuccess={(role) => navigate(ROLE_HOME[role])} />
      <DevToolbar />
    </div>
  );

  return (
    <>
      {app.isCanvasMode ? (
        <CanvasView />
      ) : (
        <Routes>
          <Route path="/" element={loginScreen} />
          <Route path="/login" element={loginScreen} />

          <Route element={<DashboardLayout />}>
            {dashboardRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}

      <SubmitShiftModal
        isOpen={app.isSubmitShiftOpen}
        onClose={() => app.setSubmitShiftOpen(false)}
        onSubmitShift={app.addEmployeeShift}
      />
      <AddVenueModal
        isOpen={app.isAddVenueOpen}
        onClose={() => app.setAddVenueOpen(false)}
        onCreate={app.addVenue}
      />
    </>
  );
}
