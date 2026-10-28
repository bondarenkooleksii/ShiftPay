import React from 'react';
import { useLocation } from 'react-router-dom';
import EmployeeHomePage from '@/features/employee/EmployeeHomePage/EmployeeHomePage';
import AdminShiftRegisterPage from '@/features/admin/AdminShiftRegisterPage/AdminShiftRegisterPage';
import { initialEmployeeShifts } from '@/mocks/shifts';
import type { UserRole } from '@/types';
import AppSidebar from '../layouts/AppSidebar';
import { useAppState } from '../AppStateProvider';
import { ROLE_NAMES, activeNavId } from '../navigation';
import { roleFromPath } from '../paths';
import { useDashboardRoutes } from '../routes';
import styles from './CanvasView.module.css';

function Artboard({
  label,
  size,
  role,
  activeId,
  children,
}: {
  label: string;
  size: string;
  role: UserRole;
  activeId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.canvasItem}>
      <div className={styles.canvasFrameLabel}>
        <span>{label}</span>
        <span className={styles.canvasFrameSize}>{size}</span>
      </div>
      <div className={styles.canvasFrame}>
        <AppSidebar role={role} activeId={activeId} />
        {children}
      </div>
    </div>
  );
}

export default function CanvasView() {
  const { pathname } = useLocation();
  const { setCanvasMode } = useAppState();
  const routes = useDashboardRoutes();
  const role = roleFromPath(pathname);
  const activeScreen = (routes.find((r) => r.path === pathname) ?? routes[0]).element;

  return (
    <div className={styles.canvasWrapper}>
      <header className={styles.canvasHeader}>
        <div className={styles.canvasBrand}>
          <div className={styles.canvasLogo}>[S/]</div>
          <span className={styles.canvasTitle}>ShiftPay — Режим Figma Canvas</span>
        </div>
        <button onClick={() => setCanvasMode(false)} className={styles.returnAppBtn}>
          ← Повернутися до додатку
        </button>
      </header>

      <div className={styles.canvasScroll}>
        <Artboard
          label={`Активний екран: ${ROLE_NAMES[role]}`}
          size="Робочий вигляд"
          role={role}
          activeId={activeNavId(role, pathname)}
        >
          {activeScreen}
        </Artboard>

        <Artboard
          label="Артборд: Панель працівника"
          size="1920 × 1080 px"
          role="employee"
          activeId="balance"
        >
          <EmployeeHomePage shifts={initialEmployeeShifts} onOpenSubmitShiftModal={() => {}} />
        </Artboard>

        <Artboard
          label="Артборд: Реєстр змін адміністратора"
          size="1920 × 1080 px"
          role="admin"
          activeId="register"
        >
          <AdminShiftRegisterPage />
        </Artboard>
      </div>
    </div>
  );
}
