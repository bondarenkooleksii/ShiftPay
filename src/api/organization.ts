import { apiClient } from '@/shared/api/client';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { ShiftTemplate, TeamMember, Venue } from '@/types';

export type NewMember = Omit<TeamMember, 'id' | 'active'>;
export type NewVenue = Pick<Venue, 'name' | 'type' | 'address'>;

export const organizationApi = {
  team: () => apiClient.get<TeamMember[]>('/team'),
  invite: (body: NewMember) =>
    apiClient.post<{ member: TeamMember; inviteLink: string }>('/team', body),
  updateMember: ({ id, ...patch }: Partial<TeamMember> & { id: string }) =>
    apiClient.patch<TeamMember>(`/team/${id}`, patch),
  venues: () => apiClient.get<Venue[]>('/venues'),
  createVenue: (body: NewVenue) => apiClient.post<Venue>('/venues', body),
  templates: () => apiClient.get<ShiftTemplate[]>('/templates'),
  createTemplate: (body: Omit<ShiftTemplate, 'id'>) =>
    apiClient.post<ShiftTemplate>('/templates', body),
  deleteTemplate: (id: string) => apiClient.delete<void>(`/templates/${id}`),
};

export const useTeam = (enabled = true) =>
  useApiQuery(enabled ? 'team' : null, organizationApi.team);

export const useInviteMember = () =>
  useApiMutation(organizationApi.invite, { invalidates: ['team', 'venues'] });

export const useUpdateMember = () =>
  useApiMutation(organizationApi.updateMember, { invalidates: ['team', 'venues'] });

export const useVenues = () => useApiQuery('venues', organizationApi.venues);

export const useCreateVenue = () =>
  useApiMutation(organizationApi.createVenue, { invalidates: ['venues'] });

export const useTemplates = () => useApiQuery('templates', organizationApi.templates);

export const useCreateTemplate = () =>
  useApiMutation(organizationApi.createTemplate, { invalidates: ['templates'] });

export const useDeleteTemplate = () =>
  useApiMutation(organizationApi.deleteTemplate, { invalidates: ['templates'] });
