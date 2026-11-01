import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/api/auth';
import { DEMO_CREDENTIALS } from '@/mocks/users';
import type { UserRole } from '@/types';
import { ROLE_HOME } from '../paths';

export function useDemoLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return async (role: UserRole) => {
    const account = DEMO_CREDENTIALS.find((a) => a.role === role);
    if (!account) return;
    await login({ ...account, remember: true });
    navigate(ROLE_HOME[role]);
  };
}
