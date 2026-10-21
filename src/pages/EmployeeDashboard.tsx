import React from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeHome from './EmployeeHome';

interface EmployeeDashboardProps {
  onLogout?: () => void;
  onRoleSwitch?: () => void;
}

export default function EmployeeDashboard({ onLogout, onRoleSwitch }: EmployeeDashboardProps = {}) {
  const employeeUser = {
    initials: 'ОБ',
    name: 'Олексій Бондаренко',
    roleLabel: 'Бариста / Працівник',
    venueLabel: 'Coffee Corner Центр',
  };

  const defaultShifts = [
    {
      id: 'shift-1',
      date: '24.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено' as const,
    },
    {
      id: 'shift-2',
      date: '22.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено' as const,
    },
    {
      id: 'shift-3',
      date: '20.09.2026',
      type: 'Денна зміна (08:00 - 16:00, без перерви)',
      hours: 8.0,
      amount: 720,
      status: 'На модерації' as const,
    },
  ];

  return (
    <div
      id="EmployeeDashboard"
      data-testid="employee-dashboard-frame"
      style={{
        width: '1920px',
        height: '1080px',
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: '#F0F7FF',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <Sidebar
        roleType="employee"
        activeNav="balance"
        onNavigate={() => {}}
        onLogout={() => onLogout?.()}
        onRoleSwitch={onRoleSwitch}
        user={employeeUser}
      />
      <EmployeeHome shifts={defaultShifts} onOpenSubmitShiftModal={() => {}} />
    </div>
  );
}
