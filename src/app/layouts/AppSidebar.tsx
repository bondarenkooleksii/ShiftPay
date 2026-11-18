import { useNavigate } from 'react-router-dom';
import Sidebar from '@/shared/layout/Sidebar';
import { useAuth } from '@/api/auth';
import { useShifts } from '@/api/shifts';
import { getInitials } from '@/shared/lib/format';
import type { UserRole } from '@/types';
import { useAppState } from '../AppStateProvider';
import { useDemoLogin } from '../dev/useDemoLogin';
import { NAV_ITEMS, ROLE_NAMES, type NavItem } from '../navigation';
import { PATHS, nextRole } from '../paths';

interface AppSidebarProps {
  role: UserRole;
  activeId?: string;
}

export default function AppSidebar({ role, activeId }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const demoLogin = useDemoLogin();
  const { setSubmitShiftOpen } = useAppState();
  const isAdmin = user?.role === 'admin' && role === 'admin';
  const { data: pending = [] } = useShifts({ status: ['pending'] }, isAdmin);

  const badges: Record<string, string> =
    isAdmin && pending.length > 0 ? { adjustments: `${pending.length} на розгляді` } : {};

  const handleSelect = (item: NavItem) => {
    if (item.action === 'submit-shift') setSubmitShiftOpen(true);
    else if (item.to) navigate(item.to);
  };

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.login);
  };

  const name = user?.name ?? ROLE_NAMES[role];

  return (
    <Sidebar
      roleName={ROLE_NAMES[role]}
      items={NAV_ITEMS[role]}
      activeId={activeId}
      onSelect={handleSelect}
      badges={badges}
      user={{
        initials: getInitials(name),
        name,
        roleLabel: user?.roleLabel ?? ROLE_NAMES[role],
        venueLabel: user?.venue,
      }}
      onLogout={handleLogout}
      onRoleSwitch={() => demoLogin(nextRole(role))}
    />
  );
}
