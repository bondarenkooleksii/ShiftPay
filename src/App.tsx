import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Sidebar from './components/Sidebar';
import ModalShift from './components/ModalShift';
import OwnerHome from './pages/OwnerHome';
import EmployeeHome from './pages/EmployeeHome';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminShiftRegister from './pages/AdminShiftRegister';

type UserRole = 'owner' | 'admin' | 'employee';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [activeNav, setActiveNav] = useState('balance');
  const [isSubmitShiftOpen, setIsSubmitShiftOpen] = useState(false);
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'app' | 'canvas'>('app');

  const [venues, setVenues] = useState<
    Array<{ id: string; name: string; type: string; address: string; staffCount: number }>
  >([
    {
      id: 'v1',
      name: 'Coffee Corner • Центр',
      type: 'Кав’ярня',
      address: 'м. Київ, вул. Хрещатик, 15',
      staffCount: 4,
    },
  ]);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueType, setNewVenueType] = useState('Кав’ярня');
  const [newVenueAddress, setNewVenueAddress] = useState('');

  const [shifts, setShifts] = useState<
    Array<{
      id: string;
      date: string;
      type: string;
      hours: number;
      amount: number;
      status: 'Підтверджено' | 'На модерації';
    }>
  >([
    {
      id: 's1',
      date: '24.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено',
    },
    {
      id: 's2',
      date: '22.09.2026',
      type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
      hours: 11.5,
      amount: 1035,
      status: 'Підтверджено',
    },
    {
      id: 's3',
      date: '20.09.2026',
      type: 'Денна зміна (08:00 - 16:00, без перерви)',
      hours: 8.0,
      amount: 720,
      status: 'На модерації',
    },
  ]);

  const handleAddShift = (newShift: {
    date: string;
    type: string;
    hours: number;
    amount: number;
    status: 'Підтверджено' | 'На модерації';
  }) => {
    setShifts([
      {
        id: Date.now().toString(),
        ...newShift,
      },
      ...shifts,
    ]);
  };

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;
    setVenues([
      ...venues,
      {
        id: Date.now().toString(),
        name: newVenueName.trim(),
        type: newVenueType,
        address: newVenueAddress.trim() || 'м. Київ',
        staffCount: 1,
      },
    ]);
    setNewVenueName('');
    setNewVenueAddress('');
    setIsAddVenueOpen(false);
  };

  const handleRoleCycle = () => {
    if (currentRole === 'employee') {
      setCurrentRole('admin');
      setActiveNav('register');
    } else if (currentRole === 'admin') {
      setCurrentRole('owner');
      setActiveNav('venues');
    } else {
      setCurrentRole('employee');
      setActiveNav('balance');
    }
  };

  const currentUser =
    currentRole === 'owner'
      ? {
          initials: 'ОБ',
          name: 'Олексій Бондаренко',
          roleLabel: 'Власник бізнесу',
        }
      : currentRole === 'admin'
        ? {
            initials: 'ДІ',
            name: 'Денис Іванов',
            roleLabel: 'Старший адміністратор',
            venueLabel: 'Coffee Corner Центр',
          }
        : {
            initials: 'ОБ',
            name: 'Олексій Бондаренко',
            roleLabel: 'Бариста / Працівник',
            venueLabel: 'Coffee Corner Центр',
          };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <LoginPage
          onLoginSuccess={(selectedRole) => {
            setCurrentRole(selectedRole);
            setActiveNav(
              selectedRole === 'owner'
                ? 'venues'
                : selectedRole === 'admin'
                  ? 'register'
                  : 'balance'
            );
            setIsAuthenticated(true);
          }}
        />

        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('app')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              viewMode === 'app'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💻 Додаток
          </button>
          <button
            onClick={() => setViewMode('canvas')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              viewMode === 'canvas'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📐 Figma Canvas
          </button>
        </div>

        {viewMode === 'canvas' && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm overflow-auto p-8 flex flex-row items-start gap-12">
            <div className="flex flex-col gap-2 shrink-0">
              <span className="font-mono text-xs text-sky-400 font-semibold">
                Frame: LoginPage (1920 × 1080)
              </span>
              <div className="rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <LoginPage
                  onLoginSuccess={(r) => {
                    setCurrentRole(r);
                    setIsAuthenticated(true);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <span className="font-mono text-xs text-sky-400 font-semibold">
                Frame: EmployeeDashboard (1920 × 1080)
              </span>
              <div className="rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <EmployeeDashboard />
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <span className="font-mono text-xs text-sky-400 font-semibold">
                Frame: AdminShiftRegister (1920 × 1080)
              </span>
              <div className="rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <AdminShiftRegister showSidebar={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'canvas') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7] flex items-center justify-center font-bold text-sm">
              [S/]
            </div>
            <span className="font-bold text-base">ShiftPay — Режим Figma Canvas</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('app')}
              className="px-4 py-1.5 bg-[#0284C7] hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              ← Повернутися до додатку
            </button>
          </div>
        </header>

        <div className="flex flex-row items-start gap-12 p-8 overflow-auto flex-1">
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Активний екран: {currentRole}</span>
              <span className="font-mono text-[11px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800">
                Робочий вигляд
              </span>
            </div>
            <div className="w-[1920px] h-[1080px] bg-[#F0F7FF] flex overflow-hidden rounded-3xl shadow-2xl border border-slate-800">
              <Sidebar
                roleType={currentRole}
                activeNav={activeNav}
                onNavigate={(id) => {
                  setActiveNav(id);
                  if (id === 'submit-shift') setIsSubmitShiftOpen(true);
                }}
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
                user={currentUser}
              />
              {currentRole === 'owner' ? (
                activeNav === 'shifts' ? (
                  <AdminShiftRegister
                    onLogout={() => setIsAuthenticated(false)}
                    onRoleSwitch={handleRoleCycle}
                  />
                ) : (
                  <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
                )
              ) : currentRole === 'admin' ? (
                <AdminShiftRegister
                  onLogout={() => setIsAuthenticated(false)}
                  onRoleSwitch={handleRoleCycle}
                />
              ) : (
                <EmployeeHome
                  shifts={shifts}
                  onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Frame: EmployeeDashboard</span>
              <span className="font-mono text-[11px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800">
                1920 × 1080 px
              </span>
            </div>
            <div className="w-[1920px] h-[1080px] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
              <EmployeeDashboard
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Frame: AdminShiftRegister</span>
              <span className="font-mono text-[11px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800">
                1920 × 1080 px
              </span>
            </div>
            <div className="w-[1920px] h-[1080px] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
              <AdminShiftRegister
                showSidebar={true}
                onLogout={() => setIsAuthenticated(false)}
                onRoleSwitch={handleRoleCycle}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#F0F7FF] flex overflow-hidden font-sans select-none relative text-[#0F172A]">
      <Sidebar
        roleType={currentRole}
        activeNav={activeNav}
        onNavigate={(navId) => {
          setActiveNav(navId);
          if (navId === 'submit-shift') {
            setIsSubmitShiftOpen(true);
          }
        }}
        onLogout={() => setIsAuthenticated(false)}
        onRoleSwitch={handleRoleCycle}
        user={currentUser}
      />

      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {currentRole === 'owner' ? (
          activeNav === 'shifts' ? (
            <AdminShiftRegister
              activeNav={activeNav}
              onNavigate={(id) => setActiveNav(id)}
              onLogout={() => setIsAuthenticated(false)}
              onRoleSwitch={handleRoleCycle}
            />
          ) : (
            <OwnerHome venues={venues} onOpenAddVenueModal={() => setIsAddVenueOpen(true)} />
          )
        ) : currentRole === 'admin' ? (
          <AdminShiftRegister
            activeNav={activeNav}
            onNavigate={(id) => setActiveNav(id)}
            onLogout={() => setIsAuthenticated(false)}
            onRoleSwitch={handleRoleCycle}
          />
        ) : (
          <EmployeeHome shifts={shifts} onOpenSubmitShiftModal={() => setIsSubmitShiftOpen(true)} />
        )}
      </div>

      <div className="fixed bottom-4 right-6 z-40 flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1 px-2 border-r border-slate-200">
          <span className="text-slate-400 font-medium mr-1">Роль:</span>
          <button
            onClick={() => {
              setCurrentRole('employee');
              setActiveNav('balance');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              currentRole === 'employee'
                ? 'bg-[#E0F2FE] text-[#0284C7]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Працівник
          </button>
          <button
            onClick={() => {
              setCurrentRole('admin');
              setActiveNav('register');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-[#E0F2FE] text-[#0284C7]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Адмін
          </button>
          <button
            onClick={() => {
              setCurrentRole('owner');
              setActiveNav('venues');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              currentRole === 'owner'
                ? 'bg-[#E0F2FE] text-[#0284C7]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Власник
          </button>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'app' ? 'canvas' : 'app')}
          title="Переглянути дизайн у форматі Figma Canvas (усі екрани поряд)"
          className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>📐 Figma Canvas</span>
        </button>
      </div>

      <ModalShift
        isOpen={isSubmitShiftOpen}
        onClose={() => setIsSubmitShiftOpen(false)}
        onSubmitShift={handleAddShift}
      />

      {isAddVenueOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[480px] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-7 relative">
            <button
              onClick={() => setIsAddVenueOpen(false)}
              className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#0F172A]">Додати новий заклад</h3>
                <p className="text-[13px] text-[#64748B]">
                  Вкажіть базову інформацію про ваш бізнес
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateVenue} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-medium text-[#64748B] block mb-1">
                  Назва закладу <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="наприклад, Espresso Bar №1"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#64748B] block mb-1">
                  Тип закладу
                </label>
                <select
                  value={newVenueType}
                  onChange={(e) => setNewVenueType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
                >
                  <option value="Кав’ярня">Кав’ярня</option>
                  <option value="Ресторан">Ресторан</option>
                  <option value="Бар / Паб">Бар / Паб</option>
                  <option value="Пекарня">Пекарня</option>
                  <option value="Салон краси / Барбершоп">Салон краси / Барбершоп</option>
                  <option value="Магазин / Роздріб">Магазин / Роздріб</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#64748B] block mb-1">
                  Адреса розташування
                </label>
                <input
                  type="text"
                  placeholder="м. Київ, вул. Хрещатик, 15"
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddVenueOpen(false)}
                  className="px-4 py-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white text-[14px] font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Зберегти та почати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
