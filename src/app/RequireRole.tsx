import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/api/auth';
import QueryState from '@/shared/ui/QueryState';
import { PATHS, ROLE_HOME, roleFromPath } from './paths';

export default function RequireRole() {
  const { user, status } = useAuth();
  const { pathname } = useLocation();

  if (status === 'checking') return <QueryState isLoading error={null} />;
  if (!user) return <Navigate to={PATHS.login} replace state={{ from: pathname }} />;
  if (roleFromPath(pathname) !== user.role) return <Navigate to={ROLE_HOME[user.role]} replace />;

  return <Outlet />;
}
