import { apiClient } from '@/shared/api/client';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Analytics, Payslip, PayoutRequest, PayoutResult } from '@/types';

export const payrollApi = {
  payout: (body: PayoutRequest) => apiClient.post<PayoutResult>('/payouts', body),
  payslips: () => apiClient.get<Payslip[]>('/payslips'),
  confirmPayslip: (id: string) => apiClient.patch<Payslip>(`/payslips/${id}/confirm`),
  analytics: (period: string) =>
    apiClient.get<Analytics>(`/analytics?period=${encodeURIComponent(period)}`),
};

export const usePayout = () =>
  useApiMutation(payrollApi.payout, { invalidates: ['shifts', 'payslips', 'analytics'] });

export const usePayslips = () => useApiQuery('payslips', payrollApi.payslips);

export const useConfirmPayslip = () =>
  useApiMutation(payrollApi.confirmPayslip, { invalidates: ['payslips'] });

export const useAnalytics = (period: string) =>
  useApiQuery(`analytics?${period}`, () => payrollApi.analytics(period));
