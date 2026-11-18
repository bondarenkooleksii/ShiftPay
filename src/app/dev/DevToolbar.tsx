import type { UserRole } from '@/types';
import { ROLE_NAMES } from '../navigation';
import { useDemoLogin } from './useDemoLogin';
import styles from './DevToolbar.module.css';

interface DevToolbarProps {
  currentRole: UserRole;
}

const ROLES: UserRole[] = ['employee', 'admin', 'owner'];

export default function DevToolbar({ currentRole }: DevToolbarProps) {
  const demoLogin = useDemoLogin();

  return (
    <div className={styles.floatingSwitcher}>
      <div className={styles.roleGroup}>
        <span className={styles.roleLabel}>Роль:</span>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => role !== currentRole && demoLogin(role)}
            title="Швидкий вхід демо-акаунтом цієї ролі"
            className={`${styles.roleBtn} ${currentRole === role ? styles.roleBtnActive : ''}`}
          >
            {ROLE_NAMES[role]}
          </button>
        ))}
      </div>
    </div>
  );
}
