import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { USERS } from '../data/mockData';
import { activeNavFromPath, navPathFor, roleFromPath } from '../routes/navigation';
import styles from '../App.module.css';

interface DashboardLayoutProps {
  onOpenCanvas: () => void;
  onOpenSubmitShift: () => void;
  sidebarBadges?: Record<string, string>;
}

const ROLE_HOME = { employee: '/employee', admin: '/admin', owner: '/owner' } as const;

export default function DashboardLayout({
  onOpenCanvas,
  onOpenSubmitShift,
  sidebarBadges,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = roleFromPath(pathname);

  const handleNavigate = (navId: string) => {
    if (navId === 'submit-shift') {
      onOpenSubmitShift();
      return;
    }
    const path = navPathFor(navId, role);
    if (path) navigate(path);
  };

  const handleRoleCycle = () => {
    const next = role === 'employee' ? 'admin' : role === 'admin' ? 'owner' : 'employee';
    navigate(ROLE_HOME[next]);
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar
        roleType={role}
        activeNav={activeNavFromPath(pathname)}
        onNavigate={handleNavigate}
        onLogout={() => navigate('/login')}
        onRoleSwitch={handleRoleCycle}
        user={USERS[role]}
        badges={sidebarBadges}
      />

      <main className={styles.mainArea}>
        <Outlet />
      </main>

      <div className={styles.floatingSwitcher}>
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel}>Роль:</span>
          {(
            [
              ['employee', 'Працівник'],
              ['admin', 'Адміністратор'],
              ['owner', 'Власник'],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              onClick={() => navigate(ROLE_HOME[r])}
              className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCanvas}
          title="Переглянути дизайн у форматі Figma Canvas (усі екрани поряд)"
          className={styles.canvasToggleBtn}
        >
          <span>📐 Figma Canvas</span>
        </button>
      </div>
    </div>
  );
}
