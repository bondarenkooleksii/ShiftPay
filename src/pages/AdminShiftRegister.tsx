import React, { useState, useEffect } from 'react';

export interface ShiftRecord {
  id: string;
  workerName: string;
  role: string;
  timeRange: string;
  breakDuration: string;
  hours: string;
  note: string;
  status: 'Підтверджено' | 'Очікує перевірки';
}

interface AdminShiftRegisterProps {
  onLogout?: () => void;
  onRoleSwitch?: () => void;
  showSidebar?: boolean;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
}

export default function AdminShiftRegister({
  onLogout,
  onRoleSwitch,
  showSidebar = false,
  activeNav: controlledNav,
  onNavigate,
}: AdminShiftRegisterProps = {}) {
  const [internalNav, setInternalNav] = useState('register');
  const activeNav = controlledNav || internalNav;
  const [filterTab, setFilterTab] = useState<'all' | 'pending'>('all');

  const [formDate, setFormDate] = useState('2026-09-24');
  const [worker, setWorker] = useState('Бондаренко Олексій (Бариста)');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [breakOption, setBreakOption] = useState('30 хв (обід)');
  const [comment, setComment] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const [shifts, setShifts] = useState<ShiftRecord[]>([
    {
      id: 'shift-adm-1',
      workerName: 'Шевченко Л.',
      role: 'Бариста',
      timeRange: '08:00 - 16:00',
      breakDuration: '0 хв',
      hours: '8.0 год',
      note: 'Вчасно',
      status: 'Підтверджено',
    },
    {
      id: 'shift-adm-2',
      workerName: 'Бондаренко О.',
      role: 'Бариста',
      timeRange: '08:00 - 20:00',
      breakDuration: '30 хв',
      hours: '11.5 год',
      note: 'Попередня заявка підтверджена',
      status: 'Підтверджено',
    },
    {
      id: 'shift-adm-3',
      workerName: 'Коваленко Д.',
      role: 'Помічник бариста',
      timeRange: '12:00 - 20:30',
      breakDuration: '30 хв',
      hours: '8.0 год',
      note: 'Вийшов на вечірнє посилення / прибирання',
      status: 'Очікує перевірки',
    },
  ]);

  useEffect(() => {
    if (activeNav === 'adjustments') {
      setFilterTab('pending');
    } else if (activeNav === 'register') {
      setFilterTab('all');
    }
  }, [activeNav]);

  const calculateTotalHours = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let diffMinutes = eh * 60 + em - (sh * 60 + sm);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      if (breakOption.includes('30')) {
        diffMinutes = Math.max(0, diffMinutes - 30);
      } else if (breakOption.includes('60') || breakOption.includes('1 год')) {
        diffMinutes = Math.max(0, diffMinutes - 60);
      }
      return (diffMinutes / 60).toFixed(1);
    } catch {
      return '11.5';
    }
  };

  const handleConfirmShift = (id: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Підтверджено' as const } : s))
    );
  };

  const handleSubmitNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedHours = `${calculateTotalHours()} год`;
    const newRecord: ShiftRecord = {
      id: `shift-adm-${Date.now()}`,
      workerName: worker.split(' ')[0] + ' ' + (worker.split(' ')[1]?.[0] || '') + '.',
      role: worker.includes('Бариста') ? 'Бариста' : 'Офіціант',
      timeRange: `${startTime} - ${endTime}`,
      breakDuration: breakOption.split(' ')[0] + ' хв',
      hours: calculatedHours,
      note: comment.trim() || 'Внесено адміністратором',
      status: 'Підтверджено',
    };
    setShifts((prev) => [newRecord, ...prev]);
    setComment('');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const filteredShifts = shifts.filter((s) => {
    if (filterTab === 'pending') return s.status === 'Очікує перевірки';
    return true;
  });

  const pendingCount = shifts.filter((s) => s.status === 'Очікує перевірки').length;

  const workspaceContent = (
    <div className="w-full flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-[#F0F7FF]">
      <header className="h-[68px] px-6 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] sm:text-[19px] font-bold text-[#0F172A] leading-tight">
            Журнал робочих змін
          </h1>
          <div className="ml-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Coffee Corner • Центр</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="hidden sm:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#0F172A]">
            <svg
              className="w-4 h-4 text-[#0284C7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <span>24 вересня 2026, Четвер</span>
          </div>

          <button
            type="button"
            className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
            title="Сповіщення"
          >
            <svg
              className="w-4.5 h-4.5"
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0284C7] rounded-full ring-2 ring-white" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[12px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Зміна активна • 3 на зміні</span>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col xl:flex-row gap-5 min-w-0">
        <section className="w-full xl:w-[380px] shrink-0 flex flex-col gap-4">
          <div
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between"
            style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
          >
            <div className="border-b border-[#F1F5F9] pb-3.5 mb-4">
              <h2 className="text-[17px] font-bold text-[#0F172A]">Внести відпрацьовану зміну</h2>
              <p className="text-[13px] text-[#64748B] mt-0.5">
                Зафіксуйте явку та години персоналу
              </p>
            </div>

            <form onSubmit={handleSubmitNewShift} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                  Дата <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                  Працівник <span className="text-rose-500">*</span>
                </label>
                <select
                  value={worker}
                  onChange={(e) => setWorker(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Бондаренко Олексій (Бариста)">Бондаренко Олексій (Бариста)</option>
                  <option value="Шевченко Лілія (Бариста)">Шевченко Лілія (Бариста)</option>
                  <option value="Коваленко Дмитро (Помічник бариста)">
                    Коваленко Дмитро (Помічник бариста)
                  </option>
                  <option value="Мельник Анна (Касир)">Мельник Анна (Касир)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                    Початок
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] focus:outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                    Кінець
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                  Перерва
                </label>
                <select
                  value={breakOption}
                  onChange={(e) => setBreakOption(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="0 хв (без перерви)">0 хв (без перерви)</option>
                  <option value="30 хв (обід)">30 хв (обід)</option>
                  <option value="45 хв (обід + кава)">45 хв (обід + кава)</option>
                  <option value="60 хв (1 год перерва)">60 хв (1 год перерва)</option>
                </select>
              </div>

              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4.5 h-4.5 text-[#0284C7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-[12.5px] text-[#0369A1] font-semibold">
                    Всього зараховано:
                  </span>
                </div>
                <span className="text-[15px] font-bold text-[#0284C7]">
                  {calculateTotalHours()} год
                </span>
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-[#475569] block mb-1">
                  Коментар / Коригування
                </label>
                <input
                  type="text"
                  placeholder="наприклад, вийшов на заміну / прибирання"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] rounded-xl px-3 py-2 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none transition-all"
                />
              </div>

              {showSavedToast && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[12.5px] font-medium flex items-center gap-2 animate-in fade-in">
                  <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span>Зміну успішно збережено в журнал!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 mt-1 bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-semibold text-[14px] rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Зберегти зміну в журнал</span>
              </button>
            </form>
          </div>
        </section>

        <section className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-between"
              style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold shrink-0">
                  <svg
                    className="w-5.5 h-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-[12.5px] font-medium text-[#64748B] block truncate">
                    Співробітників сьогодні
                  </span>
                  <span className="text-[24px] font-extrabold text-[#0F172A] tracking-tight">
                    3
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 shrink-0">
                Активні явочні
              </span>
            </div>

            <div
              className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-between"
              style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold shrink-0">
                  <svg
                    className="w-5.5 h-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-[12.5px] font-medium text-[#64748B] block truncate">
                    Зараховано годин сьогодні
                  </span>
                  <span className="text-[24px] font-extrabold text-[#0F172A] tracking-tight">
                    27.5 год
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] rounded-full border border-sky-200 shrink-0">
                Сумарний час
              </span>
            </div>
          </div>

          <div
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex flex-col gap-4 flex-1 min-w-0"
            style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
              <div>
                <h3 className="text-[17px] font-bold text-[#0F172A]">Журнал змін за сьогодні</h3>
                <p className="text-[12.5px] text-[#64748B] mt-0.5">
                  Операційний контроль відпрацьованого часу персоналу
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all');
                    onNavigate?.('register');
                  }}
                  className={`px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-white text-[#0284C7] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Всі ({shifts.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('pending');
                    onNavigate?.('adjustments');
                  }}
                  className={`px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterTab === 'pending'
                      ? 'bg-white text-[#0284C7] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span>Потребують підтвердження</span>
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#F1F5F9]">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[11.5px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                    <th className="py-3 px-4">Працівник</th>
                    <th className="py-3 px-4">Інтервал</th>
                    <th className="py-3 px-4">Перерва</th>
                    <th className="py-3 px-4">Години</th>
                    <th className="py-3 px-4">Примітка</th>
                    <th className="py-3 px-4 text-right">Статус / Дія</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[13.5px]">
                  {filteredShifts.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold text-[11px] flex items-center justify-center shrink-0 border border-sky-200">
                            {row.workerName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-[#0F172A] block leading-tight">
                              {row.workerName}
                            </span>
                            <span className="text-[11.5px] text-[#64748B]">{row.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[12.5px] text-[#334155]">
                        {row.timeRange}
                      </td>

                      <td className="py-3 px-4 text-[#475569] text-[12.5px]">
                        {row.breakDuration}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#0F172A]">{row.hours}</td>

                      <td className="py-3 px-4 text-[#475569] text-[12.5px]">
                        <span
                          className="inline-block px-2.5 py-0.5 bg-slate-100 rounded-md text-slate-700 text-[12px] max-w-[220px] truncate"
                          title={row.note}
                        >
                          {row.note}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {row.status === 'Підтверджено' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Підтверджено</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Очікує</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmShift(row.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11.5px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span>✓</span>
                              <span>Підтвердити</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );

  if (!showSidebar) {
    return workspaceContent;
  }

  return (
    <div
      id="AdminShiftRegister"
      data-testid="admin-shift-register-frame"
      className="w-[1920px] h-[1080px] bg-[#F0F7FF] flex overflow-hidden font-sans select-none relative text-[#0F172A] shrink-0"
    >
      <aside className="w-[280px] h-full bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 z-20">
        <div className="p-6 flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-sky-500/25">
                <span className="font-bold text-[15px] tracking-tight">[S/]</span>
              </div>
              <span className="text-[20px] font-bold tracking-tight text-[#0F172A]">ShiftPay</span>
            </div>
            <button
              type="button"
              onClick={onRoleSwitch}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] hover:bg-sky-200/70 rounded-full border border-sky-200 cursor-pointer"
            >
              Адміністратор
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                setInternalNav('register');
                setFilterTab('all');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] transition-all text-left cursor-pointer ${
                activeNav === 'register'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 font-medium'
              }`}
            >
              <svg
                className={`w-5 h-5 shrink-0 ${activeNav === 'register' ? 'text-[#0284C7]' : 'text-[#64748B]'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Внесення та журнал змін</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInternalNav('adjustments');
                setFilterTab('pending');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] transition-all text-left cursor-pointer ${
                activeNav === 'adjustments'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
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
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                <span>Коригування заявок</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  {pendingCount} pending
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setInternalNav('workers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] transition-all text-left cursor-pointer ${
                activeNav === 'workers'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 font-medium'
              }`}
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
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span>Працівники на зміні</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] m-3 bg-[#F8FAFC] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[14px] flex items-center justify-center shrink-0 border border-sky-200">
              ДІ
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                Денис Іванов
              </span>
              <span className="text-[12px] text-[#64748B] truncate">Старший адміністратор</span>
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

      {workspaceContent}
    </div>
  );
}
