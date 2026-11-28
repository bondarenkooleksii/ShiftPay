import { apiClient } from '@/shared/api/client';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { AdminSettings, EmployeeProfile, OwnerSettings, PasswordChange } from '@/types';

export const settingsApi = {
  owner: () => apiClient.get<OwnerSettings>('/settings/owner'),
  saveOwner: (body: OwnerSettings) => apiClient.put<OwnerSettings>('/settings/owner', body),
  admin: () => apiClient.get<AdminSettings>('/settings/admin'),
  saveAdmin: (body: AdminSettings) => apiClient.put<AdminSettings>('/settings/admin', body),
  profile: () => apiClient.get<EmployeeProfile>('/profile'),
  saveProfile: (body: EmployeeProfile) => apiClient.put<EmployeeProfile>('/profile', body),
  changePassword: (body: PasswordChange) => apiClient.post<void>('/auth/password', body),
  createTicket: (body: { category: string; message: string }) =>
    apiClient.post<{ ticketId: string }>('/support/tickets', body),
};

export const useOwnerSettings = () => useApiQuery('settings:owner', settingsApi.owner);
export const useSaveOwnerSettings = () =>
  useApiMutation(settingsApi.saveOwner, { invalidates: ['settings:owner'] });

export const useAdminSettings = () => useApiQuery('settings:admin', settingsApi.admin);
export const useSaveAdminSettings = () =>
  useApiMutation(settingsApi.saveAdmin, { invalidates: ['settings:admin'] });

export const useProfile = () => useApiQuery('profile', settingsApi.profile);
export const useSaveProfile = () =>
  useApiMutation(settingsApi.saveProfile, { invalidates: ['profile', 'shifts'] });

export const useChangePassword = () => useApiMutation(settingsApi.changePassword);

export const useCreateTicket = () => useApiMutation(settingsApi.createTicket);
