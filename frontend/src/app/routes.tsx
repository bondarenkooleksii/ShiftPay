import React from 'react';
import { useAppState } from './AppStateProvider';
import { PATHS } from './paths';
import EmployeeHomePage from '@/features/employee/EmployeeHomePage/EmployeeHomePage';
import EmployeeArchivePage from '@/features/employee/EmployeeArchivePage/EmployeeArchivePage';
import EmployeeProfilePage from '@/features/employee/EmployeeProfilePage/EmployeeProfilePage';
import AdminShiftRegisterPage from '@/features/admin/AdminShiftRegisterPage/AdminShiftRegisterPage';
import AdminAdjustmentsPage from '@/features/admin/AdminAdjustmentsPage/AdminAdjustmentsPage';
import AdminWorkersPage from '@/features/admin/AdminWorkersPage/AdminWorkersPage';
import AdminSettingsPage from '@/features/admin/AdminSettingsPage/AdminSettingsPage';
import OwnerVenuesPage from '@/features/owner/OwnerVenuesPage/OwnerVenuesPage';
import OwnerTeamPage from '@/features/owner/OwnerTeamPage/OwnerTeamPage';
import OwnerShiftsPage from '@/features/owner/OwnerShiftsPage/OwnerShiftsPage';
import OwnerAnalyticsPage from '@/features/owner/OwnerAnalyticsPage/OwnerAnalyticsPage';
import OwnerSettingsPage from '@/features/owner/OwnerSettingsPage/OwnerSettingsPage';
import OwnerSupportPage from '@/features/owner/OwnerSupportPage/OwnerSupportPage';

export interface AppRoute {
  path: string;
  element: React.ReactNode;
}

export function useDashboardRoutes(): AppRoute[] {
  const app = useAppState();

  return [
    {
      path: PATHS.employee.home,
      element: <EmployeeHomePage onOpenSubmitShiftModal={() => app.setSubmitShiftOpen(true)} />,
    },
    { path: PATHS.employee.archive, element: <EmployeeArchivePage /> },
    { path: PATHS.employee.settings, element: <EmployeeProfilePage /> },

    { path: PATHS.admin.home, element: <AdminShiftRegisterPage /> },
    { path: PATHS.admin.adjustments, element: <AdminAdjustmentsPage /> },
    { path: PATHS.admin.workers, element: <AdminWorkersPage /> },
    { path: PATHS.admin.settings, element: <AdminSettingsPage /> },

    {
      path: PATHS.owner.home,
      element: <OwnerVenuesPage onOpenAddVenueModal={() => app.setAddVenueOpen(true)} />,
    },
    { path: PATHS.owner.team, element: <OwnerTeamPage /> },
    { path: PATHS.owner.shifts, element: <OwnerShiftsPage /> },
    { path: PATHS.owner.analytics, element: <OwnerAnalyticsPage /> },
    { path: PATHS.owner.settings, element: <OwnerSettingsPage /> },
    { path: PATHS.owner.support, element: <OwnerSupportPage /> },
  ];
}
