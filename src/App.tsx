import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import LoginPage from './LoginPage';
import Sidebar from './components/Sidebar';
import ModalShift from './components/ModalShift';
import OwnerHome from './pages/OwnerHome';
import EmployeeHome from './pages/EmployeeHome';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminShiftRegister from './pages/AdminShiftRegister';
import NotFoundPage from './pages/NotFoundPage';
import styles from './App.module.css';

type UserRole = 'owner' | 'admin' | 'employee';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<'app' | 'canvas'>('app');
  const [isSubmitShiftOpen, setIsSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);

  const [venues, setVenues] = useState<
    Array<{ id: string; name: string; type: string; address: string; staffCount: number }>
  >([
    {
      id: 'v1',
      name: 'Coffee Corner • Центр',
      type: 'Кав’ярня',
      address: 'м. Київ, вул. Хрещатик, 15',
      staffCount: 4,
    },
  ]);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueType, setNewVenueType] = useState('Кав’ярня');
  const [newVenueAddress, setNewVenueAddress] = useState('');

  const [shifts, setShifts] = useState<
    Array<{
      id: string;
      date: string;
      type: string;
      hours: number;
      amount: number;
      status: 'Підтверджено' | 'На модерації';
    }>
  >([
    {
      id: 's1',
      date: '24.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено',
    },
    {
      id: 's2',
      date: '22.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено',
    },
    {
      id: 's3',
      date: '20.09.2026',
      type: 'Денна зміна (08:00 - 16:00, без перерви)',
      hours: 8.0,
      amount: 720,
      status: 'На модерації',
    },
  ]);

  const handleAddShift = (newShift: {
    date: string;
    type: string;
    hours: number;
    amount: number;
    status: 'Підтверджено' | 'На модерації';
  }) => {
    setShifts([
      {
        id: Date.now().toString(),
        ...newShift,
      },
      ...shifts,
    ]);
  };

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;
    setVenues([
      ...venues,
      {
        id: Date.now().toString(),
        name: newVenueName.trim(),
        type: newVenueType,
        address: newVenueAddress.trim() || 'м. Київ',
        staffCount: 1,
      },
    ]);
    setNewVenueName('');
    setNewVenueAddress('');
    setIsAddVenueOpen(false);
  };

  // Determine current active role from pathname
  const currentRole: UserRole = location.pathname.startsWith('/owner')
    ? 'owner'
    : location.pathname.startsWith('/admin')
      ? 'admin'
      : 'employee';

  // Determine active navigation item from pathname
  const activeNav = (() => {
    const p = location.pathname;
    if (p.includes('/shifts')) return 'shifts';
    if (p.includes('/team')) return 'team';
    if (p.includes('/analytics')) return 'analytics';
    if (p.includes('/adjustments')) return 'adjustments';
    if (p.includes('/workers')) return 'workers';
    if (p.includes('/archive')) return 'archive';
    if (p.includes('/settings')) return 'settings';
    if (p.startsWith('/owner')) return 'venues';
    if (p.startsWith('/admin')) return 'register';
    return 'balance';
  })();

  const handleRoleCycle = () => {
    if (currentRole === 'employee') {
      navigate('/admin');
    } else if (currentRole === 'admin') {
      navigate('/owner');
    } else {
      navigate('/employee');
    }
  };

  const handleNavClick = (navId: string) => {
    if (navId === 'submit-shift') {
      setIsSubmitShiftOpen(true);
      return;
    }
    switch (navId) {
      case 'venues':
        navigate('/owner');
        break;
      case 'shifts':
        navigate('/owner/shifts');
        break;
      case 'team':
        navigate('/owner/team');
        break;
      case 'analytics':
        navigate('/owner/analytics');
        break;
      case 'register':
        navigate('/admin');
        break;
      case 'adjustments':
        navigate('/admin/adjustments');
        break;
      case 'workers':
        navigate('/admin/workers');
        break;
      case 'balance':
        navigate('/employee');
        break;
      case 'archive':
        navigate('/employee/archive');
        break;
      case 'profile-settings':
        navigate('/employee/settings');
        break;
      case 'settings':
        navigate(currentRole === 'owner' ? '/owner/settings' : '/admin/settings');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const currentUser =
    currentRole === 'owner'
      ? {
          initials: 'ОБ',
          name: 'Олексій Бондаренко',
          roleLabel: 'Власник бізнесу',
        }
      : currentRole === 'admin'
        ? {
            initials: 'ДІ',
            name: 'Денис Іванов',
            roleLabel: 'Старший адміністратор',
            venueLabel: 'Coffee Corner Центр',
          }
        : {
            initials: 'ОБ',
            name: 'Олексій Бондаренко',
            roleLabel: 'Бариста / Працівник',
            venueLabel: 'Coffee Corner Центр',
          };

  if (viewMode === 'canvas') {
    return (
      <div className={styles.canvasWrapper}>
        <header className={styles.canvasHeader}>
          <div className={styles.canvasBrand}>
            <div className={styles.canvasLogo}>[S/]</div>
            <span className={styles.canvasTitle}>ShiftPay — Режим Figma Canvas</span>
          </div>
          <div>
            <button onClick={() => setViewMode('app')} className={styles.returnAppBtn}>
              ← Повернутися до додатку
            </button>
          </div>
        </header>

        <div className={styles.canvasScroll}>
          <div className={styles.canvasItem}>
            <div className={styles.canvasFrameLabel}>
              <span>Активний екран: {currentRole}</span>
              <span className={styles.canvasFrameSize}>Робочий вигляд</span>
            </div>
            <div className={styles.canvasFrame}>
              <Sidebar
                roleType={currentRole}
                activeNav={activeNav}
                onNavigate={handleNavClick}
                onLogout={handleLogout}
                onRoleSwitch={handleRoleCycle}
                user={currentUser}
              />
              {currentRole === 'owner' ? (
                activeNav === 'shifts' ? (
                  <AdminShiftRegister onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />
                ) : (
                  <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
                )
              ) : currentRole === 'admin' ? (
                <AdminShiftRegister onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />
              ) : (
                <EmployeeHome
                  shifts={shifts}
                  onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)}
                />
              )}
            </div>
          </div>

          <div className={styles.canvasItem}>
            <div className={styles.canvasFrameLabel}>
              <span>Frame: EmployeeDashboard</span>
              <span className={styles.canvasFrameSize}>1920 × 1080 px</span>
            </div>
            <div
              style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
            >
              <EmployeeDashboard onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />
            </div>
          </div>

          <div className={styles.canvasItem}>
            <div className={styles.canvasFrameLabel}>
              <span>Frame: AdminShiftRegister</span>
              <span className={styles.canvasFrameSize}>1920 × 1080 px</span>
            </div>
            <div
              style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
            >
              <AdminShiftRegister
                showSidebar={true}
                onLogout={handleLogout}
                onRoleSwitch={handleRoleCycle}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common Layout for Authenticated Dashboard Pages
  const DashboardLayout = () => (
    <div className={styles.appContainer}>
      <Sidebar
        roleType={currentRole}
        activeNav={activeNav}
        onNavigate={handleNavClick}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleCycle}
        user={currentUser}
      />

      <main className={styles.mainArea}>
        <Outlet />
      </main>

      <div className={styles.floatingSwitcher}>
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel}>Роль:</span>
          <button
            onClick={() => navigate('/employee')}
            className={`${styles.roleBtn} ${currentRole === 'employee' ? styles.roleBtnActive : ''}`}
          >
            Працівник
          </button>
          <button
            onClick={() => navigate('/admin')}
            className={`${styles.roleBtn} ${currentRole === 'admin' ? styles.roleBtnActive : ''}`}
          >
            Адмін
          </button>
          <button
            onClick={() => navigate('/owner')}
            className={`${styles.roleBtn} ${currentRole === 'owner' ? styles.roleBtnActive : ''}`}
          >
            Власник
          </button>
        </div>

        <button
          onClick={() => setViewMode('canvas')}
          title="Переглянути дизайн у форматі Figma Canvas (усі екрани поряд)"
          className={styles.canvasToggleBtn}
        >
          <span>📐 Figma Canvas</span>
        </button>
      </div>

      <ModalShift
        isOpen={isSubmitShiftOpen}
        onClose={() => setIsSubmitShiftOpen(false)}
        onSubmitShift={handleAddShift}
      />

      {isAddVenueOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <button
              onClick={() => setIsAddVenueOpen(false)}
              className={styles.modalCloseBtn}
              aria-label="Закрити модальне вікно"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderIcon} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h3 className={styles.modalTitle}>Додати новий заклад</h3>
                <p className={styles.modalSubtitle}>Вкажіть базову інформацію про ваш бізнес</p>
              </div>
            </div>

            <form onSubmit={handleCreateVenue} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Назва закладу <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="наприклад, Espresso Bar №1"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Тип закладу</label>
                <select
                  value={newVenueType}
                  onChange={(e) => setNewVenueType(e.target.value)}
                  className={styles.select}
                >
                  <option value="Кав’ярня">Кав’ярня</option>
                  <option value="Ресторан">Ресторан</option>
                  <option value="Бар / Паб">Бар / Паб</option>
                  <option value="Пекарня">Пекарня</option>
                  <option value="Салон краси / Барбершоп">Салон краси / Барбершоп</option>
                  <option value="Магазин / Роздріб">Магазин / Роздріб</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Адреса розташування</label>
                <input
                  type="text"
                  placeholder="м. Київ, вул. Хрещатик, 15"
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsAddVenueOpen(false)}
                  className={styles.cancelBtn}
                >
                  Скасувати
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Зберегти та почати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route
        path="/"
        element={
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <LoginPage
              onLoginSuccess={(role) => {
                if (role === 'owner') navigate('/owner');
                else if (role === 'admin') navigate('/admin');
                else navigate('/employee');
              }}
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
        }
      />
      <Route
        path="/login"
        element={
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <LoginPage
              onLoginSuccess={(role) => {
                if (role === 'owner') navigate('/owner');
                else if (role === 'admin') navigate('/admin');
                else navigate('/employee');
              }}
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
        }
      />

      {/* Authenticated Dashboard Nested Routes */}
      <Route element={<DashboardLayout />}>
        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <EmployeeHome
              shifts={shifts}
              onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)}
            />
          }
        />
        <Route
          path="/employee/dashboard"
          element={<EmployeeDashboard onLogout={handleLogout} onRoleSwitch={handleRoleCycle} />}
        />
        <Route
          path="/employee/archive"
          element={
            <EmployeeHome
              shifts={shifts}
              onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)}
            />
          }
        />
        <Route
          path="/employee/settings"
          element={
            <EmployeeHome
              shifts={shifts}
              onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)}
            />
          }
        />

        {/* Administrator Routes */}
        <Route
          path="/admin"
          element={
            <AdminShiftRegister
              activeNav={activeNav}
              onNavigate={handleNavClick}
              onLogout={handleLogout}
              onRoleSwitch={handleRoleCycle}
            />
          }
        />
        <Route
          path="/admin/adjustments"
          element={
            <AdminShiftRegister
              activeNav="adjustments"
              onNavigate={handleNavClick}
              onLogout={handleLogout}
              onRoleSwitch={handleRoleCycle}
            />
          }
        />
        <Route
          path="/admin/workers"
          element={
            <AdminShiftRegister
              activeNav="workers"
              onNavigate={handleNavClick}
              onLogout={handleLogout}
              onRoleSwitch={handleRoleCycle}
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminShiftRegister
              activeNav="settings"
              onNavigate={handleNavClick}
              onLogout={handleLogout}
              onRoleSwitch={handleRoleCycle}
            />
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner"
          element={
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          }
        />
        <Route
          path="/owner/shifts"
          element={
            <AdminShiftRegister
              activeNav="shifts"
              onNavigate={handleNavClick}
              onLogout={handleLogout}
              onRoleSwitch={handleRoleCycle}
            />
          }
        />
        <Route
          path="/owner/team"
          element={
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          }
        />
        <Route
          path="/owner/analytics"
          element={
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          }
        />
        <Route
          path="/owner/settings"
          element={
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          }
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
