import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import ModalShift from './components/ModalShift';
import AddVenueModal from './components/AddVenueModal';
import CanvasView from './components/CanvasView';
import DashboardLayout from './layouts/DashboardLayout';
import OwnerHome from './pages/OwnerHome';
import OwnerTeam from './pages/owner/OwnerTeam';
import OwnerShifts from './pages/owner/OwnerShifts';
import EmployeeHome from './pages/EmployeeHome';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeArchive from './pages/employee/EmployeeArchive';
import AdminShiftRegister from './pages/AdminShiftRegister';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminAdjustments from './pages/admin/AdminAdjustments';
import AdminSettings from './pages/admin/AdminSettings';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import OwnerAnalytics from './pages/owner/OwnerAnalytics';
import OwnerSettings from './pages/owner/OwnerSettings';
import SupportPage from './pages/owner/SupportPage';
import NotFoundPage from './pages/NotFoundPage';
import {
  initialAdjustments,
  initialEmployeeShifts,
  initialVenues,
  type AdjustmentRequest,
  type EmployeeShift,
  type Venue,
} from './data/mockData';
import { activeNavFromPath, navPathFor, roleFromPath } from './routes/navigation';
import styles from './App.module.css';

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [viewMode, setViewMode] = useState<'app' | 'canvas'>('app');
  const [isSubmitShiftOpen, setIsSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);

  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [shifts, setShifts] = useState<EmployeeShift[]>(initialEmployeeShifts);
  const [adjustments, setAdjustments] = useState<AdjustmentRequest[]>(initialAdjustments);

  const role = roleFromPath(pathname);
  const pendingAdjustments = adjustments.filter((a) => a.status === 'pending').length;
  const sidebarBadges: Record<string, string> =
    pendingAdjustments > 0 ? { adjustments: `${pendingAdjustments} на розгляді` } : {};

  const handleAddShift = (newShift: Omit<EmployeeShift, 'id'>) => {
    setShifts((prev) => [{ id: Date.now().toString(), ...newShift }, ...prev]);
  };

  const handleCreateVenue = (venue: { name: string; type: string; address: string }) => {
    setVenues((prev) => [...prev, { id: Date.now().toString(), staffCount: 1, ...venue }]);
  };

  const handleLogout = () => navigate('/login');
  const handleRoleCycle = () =>
    navigate(role === 'employee' ? '/admin' : role === 'admin' ? '/owner' : '/employee');

  // Pages inside the dashboard layout. Also used by Figma Canvas mode to show the active screen.
  const dashboardRoutes: Array<{ path: string; element: React.ReactNode }> = [
    {
      path: '/employee',
      element: (
        <EmployeeHome shifts={shifts} onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)} />
      ),
    },
    {
      path: '/employee/dashboard',
      element: <EmployeeDashboard onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />,
    },
    { path: '/employee/archive', element: <EmployeeArchive /> },
    { path: '/employee/settings', element: <EmployeeProfile /> },

    {
      path: '/admin',
      element: <AdminShiftRegister onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />,
    },
    {
      path: '/admin/adjustments',
      element: <AdminAdjustments requests={adjustments} onChange={setAdjustments} />,
    },
    { path: '/admin/workers', element: <AdminWorkers /> },
    { path: '/admin/settings', element: <AdminSettings /> },

    {
      path: '/owner',
      element: <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />,
    },
    { path: '/owner/team', element: <OwnerTeam venues={venues} /> },
    { path: '/owner/shifts', element: <OwnerShifts venues={venues} /> },
    { path: '/owner/analytics', element: <OwnerAnalytics /> },
    { path: '/owner/settings', element: <OwnerSettings /> },
    { path: '/owner/support', element: <SupportPage /> },
  ];

  const modals = (
    <>
      <ModalShift
        isOpen={isSubmitShiftOpen}
        onClose={() => setIsSubmitShiftOpen(false)}
        onSubmitShift={handleAddShift}
      />
      <AddVenueModal
        isOpen={isAddVenueOpen}
        onClose={() => setIsAddVenueOpen(false)}
        onCreate={handleCreateVenue}
      />
    </>
  );

  if (viewMode === 'canvas') {
    const activeScreen =
      dashboardRoutes.find((r) => r.path === pathname)?.element ?? dashboardRoutes[0].element;
    return (
      <>
        <CanvasView
          role={role}
          activeNav={activeNavFromPath(pathname)}
          activeScreen={activeScreen}
          sidebarBadges={sidebarBadges}
          onBack={() => setViewMode('app')}
          onNavigate={(navId) => {
            if (navId === 'submit-shift') return setIsSubmitShiftOpen(true);
            const path = navPathFor(navId, role);
            if (path) navigate(path);
          }}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleCycle}
        />
        {modals}
      </>
    );
  }

  const loginScreen = (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <LoginPage
        onLoginSuccess={(r) =>
          navigate(r === 'owner' ? '/owner' : r === 'admin' ? '/admin' : '/employee')
        }
      />
      <div className={styles.floatingSwitcher}>
        <button
          onClick={() => setViewMode('canvas')}
          className={styles.roleBtn}
          title="Переглянути дизайн у форматі Figma Canvas"
        >
          📐 Figma Canvas
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={loginScreen} />
        <Route path="/login" element={loginScreen} />

        <Route
          element={
            <DashboardLayout
              onOpenCanvas={() => setViewMode('canvas')}
              onOpenSubmitShift={() => setIsSubmitShiftOpen(true)}
              sidebarBadges={sidebarBadges}
            />
          }
        >
          {dashboardRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {modals}
    </>
  );
}
