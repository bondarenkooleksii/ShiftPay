import { apiClient } from '@/shared/api/client';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { DutyUpdate, DutyWorker, NewShift, Shift, ShiftStatus, ShiftUpdate } from '@/types';

export interface ShiftFilter {
  status?: ShiftStatus[];
  venue?: string;
}

const toQuery = (filter: ShiftFilter = {}) => {
  const params = new URLSearchParams();
  if (filter.status?.length) params.set('status', filter.status.join(','));
  if (filter.venue) params.set('venue', filter.venue);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const shiftsApi = {
  list: (filter?: ShiftFilter) => apiClient.get<Shift[]>(`/shifts${toQuery(filter)}`),
  create: (body: NewShift) => apiClient.post<Shift>('/shifts', body),
  update: ({ id, ...patch }: ShiftUpdate & { id: string }) =>
    apiClient.patch<Shift>(`/shifts/${id}`, patch),
  duty: () => apiClient.get<DutyWorker[]>('/duty'),
  updateDuty: ({ id, ...patch }: DutyUpdate & { id: string }) =>
    apiClient.patch<DutyWorker>(`/duty/${id}`, patch),
};

export function useShifts(filter?: ShiftFilter, enabled = true) {
  const query = toQuery(filter);
  return useApiQuery(enabled ? `shifts${query}` : null, () =>
    apiClient.get<Shift[]>(`/shifts${query}`)
  );
}

export const useCreateShift = () =>
  useApiMutation(shiftsApi.create, { invalidates: ['shifts', 'analytics'] });

export const useUpdateShift = () =>
  useApiMutation(shiftsApi.update, { invalidates: ['shifts', 'analytics'] });

export const useDutyWorkers = () => useApiQuery('duty', shiftsApi.duty);

export const useUpdateDuty = () =>
  useApiMutation(shiftsApi.updateDuty, { invalidates: ['duty', 'shifts', 'analytics'] });
