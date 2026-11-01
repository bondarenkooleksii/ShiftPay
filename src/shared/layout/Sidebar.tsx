import React from 'react';
import Icon, { type IconName } from '@/shared/ui/Icon';
import type { UserProfile } from '@/types';
import styles from './Sidebar.module.css';

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconName;
  dividerBefore?: boolean;
}

interface SidebarProps<T extends SidebarItem> {
  roleName: string;
  items: T[];
  activeId?: string;
  onSelect: (item: T) => void;
  badges?: Record<string, string>;
  user: UserProfile;
  onLogout: () => void;
  onRoleSwitch?: () => void;
}

export default function Sidebar<T extends SidebarItem>({
  roleName,
  items,
  activeId,
  onSelect,
  badges = {},
  user,
  onLogout,
  onRoleSwitch,
}: SidebarProps<T>) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.brandHeader}>
          <div className={styles.brandGroup}>
            <div className={styles.brandLogo} aria-hidden="true">
              <span>[S/]</span>
            </div>
            <span className={styles.brandText}>ShiftPay</span>
          </div>

          <button
            type="button"
            onClick={onRoleSwitch}
            title="Перемкнути роль для тестування"
            className={styles.roleBadge}
          >
            {roleName}
          </button>
        </div>

        <nav className={styles.nav} aria-label="Головна навігація">
          {items.map((item) => {
            const badge = badges[item.id];
            return (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className={styles.divider} />}
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-current={item.id === activeId ? 'page' : undefined}
                  className={`${styles.navButton} ${item.id === activeId ? styles.navButtonActive : ''}`}
                >
                  <span className={styles.navButtonContent}>
                    <span className={styles.navLeft}>
                      <Icon name={item.icon} className={styles.navIcon} />
                      <span>{item.label}</span>
                    </span>
                    {badge && <span className={styles.badgePending}>{badge}</span>}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileContent}>
          <div className={styles.avatar}>{user.initials}</div>
          <div className={styles.profileDetails}>
            <span className={styles.profileName}>{user.name}</span>
            <span className={styles.profileRole}>{user.roleLabel}</span>
            {user.venueLabel && <span className={styles.profileVenue}>{user.venueLabel}</span>}
          </div>
        </div>

        <button
          type="button"
          title="Вийти з акаунту"
          onClick={onLogout}
          className={styles.logoutButton}
        >
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
