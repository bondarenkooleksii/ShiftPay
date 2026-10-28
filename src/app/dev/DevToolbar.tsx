import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/types';
import { useAppState } from '../AppStateProvider';
import { ROLE_NAMES } from '../navigation';
import { ROLE_HOME } from '../paths';
import styles from './DevToolbar.module.css';

interface DevToolbarProps {
  currentRole?: UserRole;
}

const ROLES: UserRole[] = ['employee', 'admin', 'owner'];

export default function DevToolbar({ currentRole }: DevToolbarProps) {
  const navigate = useNavigate();
  const { setCanvasMode } = useAppState();

  return (
    <div className={styles.floatingSwitcher}>
      {currentRole && (
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel}>Роль:</span>
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => navigate(ROLE_HOME[role])}
              className={`${styles.roleBtn} ${currentRole === role ? styles.roleBtnActive : ''}`}
            >
              {ROLE_NAMES[role]}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setCanvasMode(true)}
        title="Переглянути дизайн у форматі Figma Canvas (усі екрани поряд)"
        className={styles.canvasToggleBtn}
      >
        <span>📐 Figma Canvas</span>
      </button>
    </div>
  );
}
