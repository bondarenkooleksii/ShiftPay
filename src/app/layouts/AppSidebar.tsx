import { useNavigate } from 'react-router-dom';
import Sidebar from '@/shared/layout/Sidebar';
import { USERS } from '@/mocks/users';
import type { UserRole } from '@/types';
import { useAppState } from '../AppStateProvider';
import { NAV_ITEMS, ROLE_NAMES, type NavItem } from '../navigation';
import { PATHS, ROLE_HOME, nextRole } from '../paths';

interface AppSidebarProps {
  role: UserRole;
  activeId?: string;
}

export default function AppSidebar({ role, activeId }: AppSidebarProps) {
  const navigate = useNavigate();
  const { pendingAdjustments, setSubmitShiftOpen } = useAppState();

  const badges: Record<string, string> =
    pendingAdjustments > 0 ? { adjustments: `${pendingAdjustments} на розгляді` } : {};

  const handleSelect = (item: NavItem) => {
    if (item.action === 'submit-shift') setSubmitShiftOpen(true);
    else if (item.to) navigate(item.to);
  };

  return (
    <Sidebar
      roleName={ROLE_NAMES[role]}
      items={NAV_ITEMS[role]}
      activeId={activeId}
      onSelect={handleSelect}
      badges={badges}
      user={USERS[role]}
      onLogout={() => navigate(PATHS.login)}
      onRoleSwitch={() => navigate(ROLE_HOME[nextRole(role)])}
    />
  );
}
