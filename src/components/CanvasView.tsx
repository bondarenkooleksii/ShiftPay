import React from 'react';
import Sidebar from './Sidebar';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminShiftRegister from '../pages/AdminShiftRegister';
import { USERS, type UserRole } from '../data/mockData';
import styles from '../App.module.css';

interface CanvasViewProps {
  role: UserRole;
  activeNav: string;
  activeScreen: React.ReactNode;
  sidebarBadges?: Record<string, string>;
  onBack: () => void;
  onNavigate: (navId: string) => void;
  onLogout: () => void;
  onRoleSwitch: () => void;
}

const ROLE_NAMES: Record<UserRole, string> = {
  owner: 'Власник',
  admin: 'Адміністратор',
  employee: 'Працівник',
};

export default function CanvasView({
  role,
  activeNav,
  activeScreen,
  sidebarBadges,
  onBack,
  onNavigate,
  onLogout,
  onRoleSwitch,
}: CanvasViewProps) {
  return (
    <div className={styles.canvasWrapper}>
      <header className={styles.canvasHeader}>
        <div className={styles.canvasBrand}>
          <div className={styles.canvasLogo}>[S/]</div>
          <span className={styles.canvasTitle}>ShiftPay — Режим Figma Canvas</span>
        </div>
        <button onClick={onBack} className={styles.returnAppBtn}>
          ← Повернутися до додатку
        </button>
      </header>

      <div className={styles.canvasScroll}>
        <div className={styles.canvasItem}>
          <div className={styles.canvasFrameLabel}>
            <span>Активний екран: {ROLE_NAMES[role]}</span>
            <span className={styles.canvasFrameSize}>Робочий вигляд</span>
          </div>
          <div className={styles.canvasFrame}>
            <Sidebar
              roleType={role}
              activeNav={activeNav}
              onNavigate={onNavigate}
              onLogout={onLogout}
              onRoleSwitch={onRoleSwitch}
              user={USERS[role]}
              badges={sidebarBadges}
            />
            {activeScreen}
          </div>
        </div>

        <div className={styles.canvasItem}>
          <div className={styles.canvasFrameLabel}>
            <span>Артборд: Панель працівника (EmployeeDashboard)</span>
            <span className={styles.canvasFrameSize}>1920 × 1080 px</span>
          </div>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <EmployeeDashboard onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
          </div>
        </div>

        <div className={styles.canvasItem}>
          <div className={styles.canvasFrameLabel}>
            <span>Артборд: Реєстр змін адміністратора (AdminShiftRegister)</span>
            <span className={styles.canvasFrameSize}>1920 × 1080 px</span>
          </div>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <AdminShiftRegister showSidebar onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
          </div>
        </div>
      </div>
    </div>
  );
}
