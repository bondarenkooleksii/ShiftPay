import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Sidebar from './components/Sidebar';
import ModalShift from './components/ModalShift';
import OwnerHome from './pages/OwnerHome';
import EmployeeHome from './pages/EmployeeHome';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminShiftRegister from './pages/AdminShiftRegister';
import styles from './App.module.css';

type UserRole = 'owner' | 'admin' | 'employee';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [activeNav, setActiveNav] = useState('balance');
  const [isSubmitShiftOpen, setIsSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'app' | 'canvas'>('app');

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

  const handleRoleCycle = () => {
    if (currentRole === 'employee') {
      setCurrentRole('admin');
      setActiveNav('register');
    } else if (currentRole === 'admin') {
      setCurrentRole('owner');
      setActiveNav('venues');
    } else {
      setCurrentRole('employee');
      setActiveNav('balance');
    }
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

  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <LoginPage
          onLoginSuccess={(selectedRole) => {
            setCurrentRole(selectedRole);
            setActiveNav(
              selectedRole === 'owner'
                ? 'venues'
                : selectedRole === 'admin'
                  ? 'register'
                  : 'balance'
            );
            setIsAuthenticated(true);
          }}
        />

        <div className={styles.floatingSwitcher}>
          <button
            onClick={() => setViewMode('app')}
            className={`${styles.roleBtn} ${viewMode === 'app' ? styles.roleBtnActive : ''}`}
          >
            💻 Додаток
          </button>
          <button
            onClick={() => setViewMode('canvas')}
            className={`${styles.roleBtn} ${viewMode === 'canvas' ? styles.roleBtnActive : ''}`}
          >
            📐 Figma Canvas
          </button>
        </div>

        {viewMode === 'canvas' && (
          <div className={styles.loginCanvasOverlay}>
            <div className={styles.canvasItem}>
              <span className={styles.canvasFrameSize}>Frame: LoginPage (1920 × 1080)</span>
              <div
                style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
              >
                <LoginPage
                  onLoginSuccess={(r) => {
                    setCurrentRole(r);
                    setIsAuthenticated(true);
                  }}
                />
              </div>
            </div>
            <div className={styles.canvasItem}>
              <span className={styles.canvasFrameSize}>Frame: EmployeeDashboard (1920 × 1080)</span>
              <div
                style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
              >
                <EmployeeDashboard />
              </div>
            </div>
            <div className={styles.canvasItem}>
              <span className={styles.canvasFrameSize}>
                Frame: AdminShiftRegister (1920 × 1080)
              </span>
              <div
                style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
              >
                <AdminShiftRegister showSidebar={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
                onNavigate={(id) => {
                  setActiveNav(id);
                  if (id === 'submit-shift') setIsSubmitShiftOpen(true);
                }}
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
                user={currentUser}
              />
              {currentRole === 'owner' ? (
                activeNav === 'shifts' ? (
                  <AdminShiftRegister
                    onLogout={() => setIsAuthenticated(false)}
                    onRoleSwitch={handleRoleCycle}
                  />
                ) : (
                  <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
                )
              ) : currentRole === 'admin' ? (
                <AdminShiftRegister
                  onLogout={() => setIsAuthenticated(false)}
                  onRoleSwitch={handleRoleCycle}
                />
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
              <EmployeeDashboard
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
              />
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
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Sidebar
        roleType={currentRole}
        activeNav={activeNav}
        onNavigate={(navId) => {
          setActiveNav(navId);
          if (navId === 'submit-shift') {
            setIsSubmitShiftOpen(true);
          }
        }}
        onLogout={() => setIsAuthenticated(false)}
        onRoleSwitch={handleRoleCycle}
        user={currentUser}
      />

      <div className={styles.mainArea}>
        {currentRole === 'owner' ? (
          activeNav === 'shifts' ? (
            <AdminShiftRegister
              activeNav={activeNav}
              onNavigate={(id) => setActiveNav(id)}
              onLogout={() => setIsAuthenticated(false)}
              onRoleSwitch={handleRoleCycle}
            />
          ) : (
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          )
        ) : currentRole === 'admin' ? (
          <AdminShiftRegister
            activeNav={activeNav}
            onNavigate={(id) => setActiveNav(id)}
            onLogout={() => setIsAuthenticated(false)}
            onRoleSwitch={handleRoleCycle}
          />
        ) : (
          <EmployeeHome shifts={shifts} onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)} />
        )}
      </div>

      <div className={styles.floatingSwitcher}>
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel}>Роль:</span>
          <button
            onClick={() => {
              setCurrentRole('employee');
              setActiveNav('balance');
            }}
            className={`${styles.roleBtn} ${currentRole === 'employee' ? styles.roleBtnActive : ''}`}
          >
            Працівник
          </button>
          <button
            onClick={() => {
              setCurrentRole('admin');
              setActiveNav('register');
            }}
            className={`${styles.roleBtn} ${currentRole === 'admin' ? styles.roleBtnActive : ''}`}
          >
            Адмін
          </button>
          <button
            onClick={() => {
              setCurrentRole('owner');
              setActiveNav('venues');
            }}
            className={`${styles.roleBtn} ${currentRole === 'owner' ? styles.roleBtnActive : ''}`}
          >
            Власник
          </button>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'app' ? 'canvas' : 'app')}
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
}
