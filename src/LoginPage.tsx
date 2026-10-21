import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess?: (role: 'employee' | 'owner' | 'admin') => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [role, setRole] = useState<'employee' | 'owner' | 'admin'>('employee');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    }, 400);
  };

  return (
    <div className="w-full min-h-screen bg-[#F0F7FF] flex flex-col justify-between items-center relative overflow-x-hidden font-sans select-none text-[#0F172A] p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"
      />

      <div className="h-4" />

      <div className="w-full max-w-[460px] z-10 my-auto">
        <section
          aria-label="Форма входу ShiftPay"
          className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-9"
          style={{
            boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)',
          }}
        >
          <header className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div
                className="w-9 h-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-sky-500/25"
                aria-hidden="true"
              >
                <span className="font-bold text-[15px] tracking-tight">[S/]</span>
              </div>
              <span className="text-[22px] font-bold tracking-tight text-[#0F172A]">ShiftPay</span>
            </div>

            <h1 className="text-[24px] font-bold text-[#0F172A] leading-tight mb-2">
              Вхід у систему
            </h1>

            <p className="text-[14px] text-[#64748B] font-normal leading-normal">
              Оберіть тип облікового запису
            </p>
          </header>

          <div
            role="tablist"
            aria-label="Вибір ролі"
            className="grid grid-cols-3 gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mt-6 mb-6 select-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === 'employee'}
              onClick={() => setRole('employee')}
              className={`py-2 px-2 text-[13px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer ${
                role === 'employee'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
              }`}
            >
              <span>Працівник</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === 'admin'}
              onClick={() => setRole('admin')}
              className={`py-2 px-2 text-[13px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer ${
                role === 'admin'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
              }`}
            >
              <span>Адмін</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === 'owner'}
              onClick={() => setRole('owner')}
              className={`py-2 px-2 text-[13px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
              }`}
            >
              <span>Власник</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="loginEmail" className="text-[14px] font-medium text-[#64748B]">
                Електронна пошта або телефон
              </label>
              <div className="relative flex items-center">
                <div
                  className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <input
                  id="loginEmail"
                  type="text"
                  required
                  autoComplete="username"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white text-[#0F172A] placeholder:text-[#94A3B8] text-[15px] pl-11 pr-4 py-2.5 rounded-lg border border-[#CBD5E1] hover:border-slate-400 focus:border-[#0284C7] focus:ring-3 focus:ring-sky-100 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="loginPassword" className="text-[14px] font-medium text-[#64748B]">
                Пароль
              </label>
              <div className="relative flex items-center">
                <div
                  className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-[#0F172A] placeholder:text-[#94A3B8] text-[15px] pl-11 pr-11 py-2.5 rounded-lg border border-[#CBD5E1] hover:border-slate-400 focus:border-[#0284C7] focus:ring-3 focus:ring-sky-100 focus:outline-none transition-colors tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                  className="absolute right-3 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-[14px]">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#0284C7] focus:ring-[#0284C7] focus:ring-offset-0 cursor-pointer accent-[#0284C7]"
                />
                <span className="text-[#64748B] group-hover:text-[#0F172A] transition-colors">
                  Запам'ятати мене
                </span>
              </label>

              <a
                href="#forgot-password"
                onClick={(e) => e.preventDefault()}
                className="text-[#0284C7] hover:text-sky-700 font-medium transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Забули пароль?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 w-full h-[48px] bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-semibold text-[15px] rounded-xl shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all duration-150 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Вхід...</span>
                </span>
              ) : (
                'Увійти'
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#F1F5F9] text-center">
            <p className="text-[14px] text-[#64748B]">
              Не маєте акаунту?{' '}
              <a
                href="#register"
                onClick={(e) => e.preventDefault()}
                className="text-[#0284C7] hover:text-sky-700 font-semibold transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Зареєструватися
              </a>
            </p>
          </div>
        </section>
      </div>

      <footer className="w-full text-center py-5 z-10">
        <p className="text-[12px] text-[#94A3B8] font-normal tracking-wide">
          © 2026 ShiftPay • Безпечний вхід для закладів та персоналу
        </p>
      </footer>
    </div>
  );
}
