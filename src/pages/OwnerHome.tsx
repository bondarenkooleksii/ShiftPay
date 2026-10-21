import React, { useState } from 'react';
import Header from '../components/Header';

interface OwnerHomeProps {
  venues: Array<{ id: string; name: string; type: string; address: string; staffCount: number }>;
  onOpenAddVenueModal: () => void;
}

export default function OwnerHome({ venues, onOpenAddVenueModal }: OwnerHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex-1 h-full flex flex-col min-w-0 select-none overflow-hidden">
      <Header
        title="Мої заклади"
        subtitleOrBadge={
          <nav
            aria-label="Breadcrumb"
            className="text-[12px] text-[#64748B] flex items-center gap-1.5 ml-2"
          >
            <span className="hover:text-[#0284C7] cursor-pointer">Головна</span>
            <span>/</span>
            <span className="text-[#0284C7] font-medium">Заклади</span>
          </nav>
        }
        rightContent={
          <>
            <div className="relative w-[320px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Пошук закладів або адрес..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 rounded-lg pl-9 pr-4 py-2 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none transition-all"
              />
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
              onClick={onOpenAddVenueModal}
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
              <span>Додати заклад</span>
            </button>
          </>
        }
      />

      <main className="w-full flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 left-24 w-80 h-80 rounded-full bg-sky-200/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-12 right-24 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"
        />

        {venues.length === 0 ? (
          <section
            aria-label="Створення закладу"
            className="w-[680px] bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-10 flex flex-col items-center text-center relative z-10"
            style={{
              boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)',
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl bg-[#E0F2FE] border border-sky-200 flex items-center justify-center text-[#0284C7] shadow-sm mb-6"
              aria-hidden="true"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5m13.5 10.5h6.75A2.25 2.25 0 0022.5 18.75V10.5m-20.25 0l9.308-6.981a1.5 1.5 0 011.884 0l9.308 6.981m-20.25 0A2.25 2.25 0 012.25 7.5h19.5a2.25 2.25 0 012.25 3m-24 0h24"
                />
              </svg>
            </div>

            <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-3">
              Створіть свій перший заклад
            </h2>

            <p className="text-[15px] text-[#64748B] max-w-[530px] leading-relaxed mb-8">
              Щоб почати облік робочих змін, призначати адміністраторів та налаштовувати заробітну
              плату, додайте вашу кав'ярню, бар чи ресторан.
            </p>

            <button
              type="button"
              onClick={onOpenAddVenueModal}
              className="h-[48px] px-8 bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-semibold text-[15px] rounded-xl shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Створити заклад</span>
            </button>

            <div className="w-full mt-10 pt-8 border-t border-[#F1F5F9] flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-3 py-1.5 rounded-lg border border-sky-200">
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                <span>1. Створіть заклад</span>
              </div>

              <div className="text-[#CBD5E1]" aria-hidden="true">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span>2. Запросіть команду</span>
              </div>

              <div className="text-[#CBD5E1]" aria-hidden="true">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span>3. Контролюйте виплати</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="w-full max-w-5xl z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-[#0F172A]">
                  Активні заклади ({filteredVenues.length})
                </h2>
                <p className="text-[14px] text-[#64748B]">
                  Керуйте змінами та ставками персоналу для кожного закладу
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:border-[#0284C7] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5m13.5 10.5h6.75A2.25 2.25 0 0022.5 18.75V10.5m-20.25 0l9.308-6.981a1.5 1.5 0 011.884 0l9.308 6.981m-20.25 0A2.25 2.25 0 012.25 7.5h19.5a2.25 2.25 0 012.25 3m-24 0h24"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[17px] font-bold text-[#0F172A]">{venue.name}</h3>
                          <span className="text-[13px] text-[#64748B]">
                            {venue.type} • {venue.address}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                        Активний
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-[#F1F5F9] text-[13px]">
                      <div>
                        <span className="text-[#64748B] block">Персонал:</span>
                        <span className="font-semibold text-[#0F172A]">
                          {venue.staffCount} працівник
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Статус змін:</span>
                        <span className="font-semibold text-emerald-600">Зміна відкрита</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer">
                      Налаштування
                    </button>
                    <button className="px-3 py-1.5 text-[13px] text-[#0284C7] font-semibold bg-[#E0F2FE] hover:bg-sky-100 rounded-lg cursor-pointer">
                      Перейти до змін →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-6 text-[12px] text-[#94A3B8]">
          ShiftPay Core Platform v2.4 • Система обліку змін та розрахунку заробітної плати
        </div>
      </main>
    </div>
  );
}
