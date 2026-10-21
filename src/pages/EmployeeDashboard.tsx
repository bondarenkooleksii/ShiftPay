import React, { useState } from 'react';
import ModalShift from '../components/ModalShift';

interface EmployeeDashboardProps {
  onLogout?: () => void;
  onRoleSwitch?: () => void;
}

export default function EmployeeDashboard({ onLogout, onRoleSwitch }: EmployeeDashboardProps = {}) {
  const [selectedMonth, setSelectedMonth] = useState('Вересень 2026');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [bannerConfirmed, setBannerConfirmed] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [shifts, setShifts] = useState([
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
      status: 'На перевірці' as const,
    },
  ]);

  const filteredShifts = shifts.filter((s) => {
    if (shiftFilter === 'confirmed') return s.status === 'Підтверджено';
    if (shiftFilter === 'pending') return s.status === 'На перевірці';
    return true;
  });

  const handleAddShift = (newShift: {
    date: string;
    type: string;
    hours: number;
    amount: number;
    status: 'Підтверджено' | 'На модерації';
  }) => {
    setShifts((prev) => [
      {
        id: `shift-${Date.now()}`,
        date: newShift.date,
        type: newShift.type,
        hours: newShift.hours,
        amount: newShift.amount,
        status:
          newShift.status === 'Підтверджено'
            ? ('Підтверджено' as const)
            : ('На перевірці' as const),
      },
      ...prev,
    ]);
  };

  return (
    <div
      id="EmployeeDashboard"
      data-testid="employee-dashboard-frame"
      className="w-full h-full min-h-screen bg-[#F0F7FF] flex overflow-hidden font-sans select-none relative text-[#0F172A]"
    >
      <aside className="w-[280px] h-full bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 z-20">
        <div className="p-6 flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-sky-500/25"
                aria-hidden="true"
              >
                <span className="font-bold text-[15px] tracking-tight">[S/]</span>
              </div>
              <span className="text-[20px] font-bold tracking-tight text-[#0F172A]">ShiftPay</span>
            </div>

            <button
              type="button"
              onClick={onRoleSwitch}
              title="Перемкнути роль"
              className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] hover:bg-sky-200/70 transition-colors rounded-full border border-sky-200 cursor-pointer"
            >
              Працівник
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5" aria-label="Головне меню працівника">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold bg-[#E0F2FE] text-[#0284C7] transition-all text-left cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0 text-[#0284C7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Мій баланс і зміни</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0 text-[#64748B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z"
                />
              </svg>
              <span>Подати зміну</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0 text-[#64748B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span>Архів виплат та чеків</span>
            </button>

            <div className="my-2 border-t border-[#F1F5F9]" />

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0 text-[#64748B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Налаштування профілю</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] m-3 bg-[#F8FAFC] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[14px] flex items-center justify-center shrink-0 border border-sky-200">
              ОБ
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                Олексій Бондаренко
              </span>
              <span className="text-[12px] text-[#64748B] truncate">Бариста / Працівник</span>
              <span className="text-[11px] text-[#0284C7] truncate font-medium">
                Coffee Corner Центр
              </span>
            </div>
          </div>

          <button
            type="button"
            title="Вийти з акаунту"
            onClick={onLogout}
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-white rounded-lg transition-colors ml-1 shrink-0 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
      </aside>

      <div className="flex-1 h-full flex flex-col min-w-0">
        <header className="h-[72px] px-8 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[19px] font-bold text-[#0F172A] leading-tight">
              Особистий кабінет
            </h1>
            <div className="ml-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Coffee Corner • Центр</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 rounded-xl px-3.5 py-2 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] cursor-pointer"
              >
                <option value="Вересень 2026">Вересень 2026</option>
                <option value="Серпень 2026">Серпень 2026</option>
                <option value="Липень 2026">Липень 2026</option>
              </select>
            </div>

            <button
              type="button"
              className="relative p-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Сповіщення"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#0284C7] rounded-full ring-2 ring-white" />
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="h-10 px-4 bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-[14px] font-semibold rounded-xl shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Подати зміну</span>
            </button>
          </div>
        </header>

        <main className="w-full flex-1 p-8 overflow-y-auto flex flex-col gap-6">
          {!bannerConfirmed ? (
            <div className="w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#DBEAFE] text-[#0284C7] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </div>
                <p className="text-[14px] text-[#1E3A8A] font-medium">
                  Власник надіслав виплату <span className="font-bold text-[#0F172A]">8 280 ₴</span>{' '}
                  за першу половину вересня. Перегляньте квитанцію.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#0284C7] bg-white border border-[#BFDBFE] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                >
                  Переглянути квитанцію
                </button>
                <button
                  type="button"
                  onClick={() => setBannerConfirmed(true)}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13px] font-semibold rounded-lg shadow-sm shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Гроші прийшли</span>
                  <span className="font-bold">✓</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 px-4 flex items-center justify-between text-emerald-800 text-[14px] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[12px] font-bold">
                  ✓
                </span>
                <span>Виплату 8 280 ₴ успішно підтверджено працівником.</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerConfirmed(false)}
                className="text-[12px] text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Показати банер
              </button>
            </div>
          )}

          <section aria-label="KPI показники" className="grid grid-cols-3 gap-6">
            <div
              className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
              style={{ boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}
            >
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-medium text-[#64748B]">Поточний заробіток</span>
                <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                  Очікує підтвердження
                </span>
              </div>
              <div className="my-3">
                <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                  8 280 ₴
                </span>
              </div>
              <div className="text-[13px] text-[#64748B] flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
                <span className="text-amber-600 font-medium">(Очікує підтв.: 8 280 ₴)</span>
              </div>
            </div>

            <div
              className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
              style={{ boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}
            >
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-medium text-[#64748B]">Відпрацьований час</span>
                <span className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] rounded-full border border-sky-200">
                  Вересень
                </span>
              </div>
              <div className="my-3">
                <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                  92.0 год
                </span>
              </div>
              <div className="text-[13px] text-[#64748B] flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                <span className="font-medium text-[#0F172A]">8 закритих змін</span>
                <span className="text-[12px] text-slate-400">Норма: 160 год</span>
              </div>
            </div>

            <div
              className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
              style={{ boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}
            >
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-medium text-[#64748B]">Моя ставка</span>
                <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  Погодинна
                </span>
              </div>
              <div className="my-3 flex items-baseline gap-1.5">
                <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                  90 ₴
                </span>
                <span className="text-[16px] font-semibold text-[#64748B]">/ год</span>
              </div>
              <div className="text-[13px] text-emerald-600 font-medium flex items-center gap-1 pt-2 border-t border-[#F1F5F9]">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>+400 ₴ бонусів за інвентаризацію</span>
              </div>
            </div>
          </section>

          <section
            aria-label="Останні відпрацьовані зміни"
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-5"
            style={{ boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#0F172A]">
                  Останні відпрацьовані зміни
                </h2>
                <p className="text-[13px] text-[#64748B]">
                  Деталізація часу, тривалості та нарахованої суми
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShiftFilter('all')}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                    shiftFilter === 'all'
                      ? 'bg-white text-[#0284C7] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Всі
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('confirmed')}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                    shiftFilter === 'confirmed'
                      ? 'bg-white text-[#0284C7] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Підтверджені
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('pending')}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                    shiftFilter === 'pending'
                      ? 'bg-white text-[#0284C7] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  На перевірці
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#F1F5F9]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[12px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                    <th className="py-3.5 px-6">Дата</th>
                    <th className="py-3.5 px-6">Тип зміни</th>
                    <th className="py-3.5 px-6">Години</th>
                    <th className="py-3.5 px-6">Сума</th>
                    <th className="py-3.5 px-6 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[14px]">
                  {filteredShifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#0F172A]">{shift.date}</td>
                      <td className="py-4 px-6 text-[#475569]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                          <span>{shift.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-[#0F172A]">
                        {shift.hours.toFixed(1)} год
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0284C7]">
                        {shift.amount.toLocaleString('uk-UA')} ₴
                      </td>
                      <td className="py-4 px-6 text-right">
                        {shift.status === 'Підтверджено' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Підтверджено</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>На перевірці</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            aria-label="Архів виплат"
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4"
            style={{ boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h2 className="text-[17px] font-bold text-[#0F172A]">Архів виплат</h2>
              <span className="text-[13px] text-[#64748B]">Історія закритих розрахунків</span>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center font-bold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] text-[#0F172A] font-semibold">15.09.2026 — 7 600 ₴</p>
                  <p className="text-[13px] text-[#0284C7] font-mono mt-0.5">
                    receipt_monobank_1509.pdf
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Оплачено
                </span>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-3.5 py-1.5 text-[13px] font-medium text-[#0284C7] hover:bg-sky-100/60 rounded-lg border border-sky-200 bg-white transition-colors cursor-pointer"
                >
                  Переглянути чек ↗
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {showReceiptModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[450px] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg cursor-pointer"
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

            <div className="text-center pt-2 pb-4 border-b border-[#F1F5F9]">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-[20px] font-bold">
                ✓
              </div>
              <h3 className="text-[17px] font-bold text-[#0F172A]">Офіційна квитанція ShiftPay</h3>
              <p className="text-[12px] text-[#64748B]">Платіжне доручення №SP-98214-UA</p>
            </div>

            <div className="py-4 flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Отримувач:</span>
                <span className="font-semibold text-[#0F172A]">
                  Олексій Бондаренко (IBAN: UA•••4921)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Заклад:</span>
                <span className="font-semibold text-[#0F172A]">Coffee Corner Центр</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Період виплати:</span>
                <span className="font-semibold text-[#0F172A]">01.09.2026 — 15.09.2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Файл документа:</span>
                <span className="font-mono text-[#0284C7]">receipt_monobank_1509.pdf</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F1F5F9]">
                <span className="text-[#64748B] font-medium">Сума виплати:</span>
                <span className="font-bold text-[#0284C7] text-[16px]">8 280,00 ₴</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold text-[14px] rounded-xl cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalShift
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitShift={handleAddShift}
      />
    </div>
  );
}
