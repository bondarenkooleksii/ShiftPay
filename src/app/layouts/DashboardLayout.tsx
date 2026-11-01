import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import DevToolbar from '../dev/DevToolbar';
import { activeNavId } from '../navigation';
import { roleFromPath } from '../paths';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const role = roleFromPath(pathname);

  return (
    <div className={styles.appContainer}>
      <AppSidebar role={role} activeId={activeNavId(role, pathname)} />

      <main className={styles.mainArea}>
        <Outlet />
      </main>

      <DevToolbar currentRole={role} />
    </div>
  );
}
