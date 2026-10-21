import React, { useState } from 'react';

interface ModalShiftProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitShift: (shift: {
    date: string;
    type: string;
    hours: number;
    amount: number;
    status: 'Підтверджено' | 'На модерації';
  }) => void;
}

export default function ModalShift({ isOpen, onClose, onSubmitShift }: ModalShiftProps) {
  const [shiftDate, setShiftDate] = useState('2026-09-25');
  const [shiftType, setShiftType] = useState('Денна зміна (08:00 - 20:00, перерва 30 хв)');
  const [hours, setHours] = useState('11.5');
  const [hourlyRate] = useState(90);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours) || 8;
    const formattedDate = shiftDate.split('-').reverse().join('.');
    onSubmitShift({
      date: formattedDate,
      type: shiftType,
      hours: h,
      amount: Math.round(h * hourlyRate),
      status: 'На модерації',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[500px] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg transition-colors cursor-pointer"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#0F172A]">Подати робочу зміну</h3>
            <p className="text-[13px] text-[#64748B]">Coffee Corner • Центр (Ставка: 90 ₴ / год)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-medium text-[#64748B] block mb-1">Дата зміни</label>
            <input
              type="date"
              required
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#64748B] block mb-1">
              Тип зміни та графік
            </label>
            <select
              value={shiftType}
              onChange={(e) => {
                setShiftType(e.target.value);
                if (e.target.value.includes('11.5')) setHours('11.5');
                else if (e.target.value.includes('8.0')) setHours('8.0');
                else if (e.target.value.includes('6.0')) setHours('6.0');
              }}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
            >
              <option value="Денна зміна (08:00 - 20:00, перерва 30 хв)">
                Денна зміна (08:00 - 20:00, перерва 30 хв) — 11.5 год
              </option>
              <option value="Ранкова зміна (08:00 - 16:00, без перерви)">
                Ранкова зміна (08:00 - 16:00, без перерви) — 8.0 год
              </option>
              <option value="Вечірня зміна (16:00 - 22:00, без перерви)">
                Вечірня зміна (16:00 - 22:00, без перерви) — 6.0 год
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-[#64748B] block mb-1">
                Кількість годин
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#64748B] block mb-1">
                Орієнтовна виплата
              </label>
              <div className="w-full bg-sky-50 border border-sky-200 rounded-lg px-3.5 py-2 text-[14px] font-bold text-[#0284C7]">
                {(parseFloat(hours) || 0) * 90} ₴
              </div>
            </div>
          </div>

          <div className="mt-3 pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white text-[14px] font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Відправити на модерацію
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
