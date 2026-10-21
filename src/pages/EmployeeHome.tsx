import React, { useState } from 'react';
import Header from '../components/Header';

interface ShiftItem {
  id: string;
  date: string;
  type: string;
  hours: number;
  amount: number;
  status: 'Підтверджено' | 'На модерації';
}

interface EmployeeHomeProps {
  shifts: ShiftItem[];
  onOpenSubmitShiftModal: () => void;
}

export default function EmployeeHome({ shifts, onOpenSubmitShiftModal }: EmployeeHomeProps) {
  const [selectedMonth, setSelectedMonth] = useState('Вересень 2026');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [bannerConfirmed, setBannerConfirmed] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredShifts = shifts.filter((s) => {
    if (shiftFilter === 'confirmed') return s.status === 'Підтверджено';
    if (shiftFilter === 'pending') return s.status === 'На модерації';
    return true;
  });

  return (
    <div className="w-full flex-1 h-full flex flex-col min-w-0 select-none overflow-hidden">
      <Header
        title="Особистий кабінет"
        subtitleOrBadge={
          <div className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Coffee Corner • Центр</span>
          </div>
        }
        rightContent={
          <>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] cursor-pointer"
              >
                <option value="Вересень 2026">Вересень 2026</option>
                <option value="Серпень 2026">Серпень 2026</option>
                <option value="Липень 2026">Липень 2026</option>
              </select>
            </div>

            <button
              type="button"
              className="relative p-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
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
              onClick={onOpenSubmitShiftModal}
              className="h-10 px-4 bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-[14px] font-semibold rounded-lg shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
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
          </>
        }
      />

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
                за першу половину вересня. Перегляньте чек.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="px-4 py-2 text-[13px] font-semibold text-[#0284C7] hover:bg-sky-100/70 rounded-lg transition-colors cursor-pointer"
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
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 px-4 flex items-center justify-between text-emerald-800 text-[14px] font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[12px] font-bold">
                ✓
              </span>
              <span>
                Виплату 8 280 ₴ успішно підтверджено працівником. Дякуємо за оперативність!
              </span>
            </div>
            <button
              onClick={() => setBannerConfirmed(false)}
              className="text-[12px] text-emerald-600 underline cursor-pointer"
            >
              Відновити банер
            </button>
          </div>
        )}

        <section aria-label="Метрики та баланс" className="grid grid-cols-3 gap-6">
          <div
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-medium text-[#64748B]">Поточний баланс</span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                В очікуванні
              </span>
            </div>
            <div className="my-3">
              <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                8 280 ₴
              </span>
            </div>
            <div className="text-[13px] text-[#64748B] flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
              <span className="font-medium text-[#0F172A]">8 змін</span>
              <span>•</span>
              <span className="text-amber-600 font-medium">(Очікує підтвердження: 8 280 ₴)</span>
            </div>
          </div>

          <div
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-medium text-[#64748B]">Відпрацьований час</span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] rounded-full border border-sky-200">
                57% плану
              </span>
            </div>
            <div className="my-3">
              <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                92.0 год
              </span>
            </div>
            <div className="text-[13px] text-[#64748B] flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
              <span>Норма місяця: 160 год (57%)</span>
              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#0284C7] h-full rounded-full" style={{ width: '57%' }} />
              </div>
            </div>
          </div>

          <div
            className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between"
            style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.08)' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-medium text-[#64748B]">Моя ставка</span>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                Погодинна
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1.5">
              <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">90 ₴</span>
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
              <span>+400 ₴ бонусів за чистоту та сервіс</span>
            </div>
          </div>
        </section>

        <section
          aria-label="Останні відпрацьовані зміни"
          className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] overflow-hidden"
          style={{ boxShadow: '0 10px 25px -10px rgba(2, 132, 199, 0.05)' }}
        >
          {/* Header & Tabs */}
          <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">Останні відпрацьовані зміни</h2>
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
                Всі ({shifts.length})
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[12px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <th className="py-3 px-6">Дата</th>
                  <th className="py-3 px-6">Тип зміни та деталі</th>
                  <th className="py-3 px-6">Години</th>
                  <th className="py-3 px-6">Сума до виплати</th>
                  <th className="py-3 px-6 text-right">Статус</th>
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
                          <span>На модерації</span>
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
          aria-label="Останні закриті виплати"
          className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#475569] flex items-center justify-center font-bold">
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Останні закриті виплати
              </span>
              <p className="text-[14px] text-[#0F172A] font-medium mt-0.5">
                <span className="font-semibold">15.09.2026</span> —{' '}
                <span className="font-bold text-[#0284C7]">7 600 ₴</span>{' '}
                <span className="text-[#64748B] text-[13px]">[Файл: receipt_mono_15_09.png]</span>
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
              className="px-3.5 py-1.5 text-[13px] font-medium text-[#0284C7] hover:bg-sky-50 rounded-lg border border-sky-200 transition-colors cursor-pointer"
            >
              Завантажити чек ↗
            </button>
          </div>
        </section>
      </main>

      {showReceiptModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[440px] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 relative">
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
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-[20px]">
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
                <span className="text-[#64748B]">Період:</span>
                <span className="font-semibold text-[#0F172A]">01.09.2026 — 15.09.2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Сума виплати:</span>
                <span className="font-bold text-[#0284C7] text-[16px]">8 280,00 ₴</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold text-[14px] rounded-xl cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
