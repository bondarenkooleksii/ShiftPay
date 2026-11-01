import React, { useState } from 'react';
import styles from './LoginPage.module.css';

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
    <div className={styles.container}>
      <div aria-hidden="true" className={styles.ambientLight1} />
      <div aria-hidden="true" className={styles.ambientLight2} />

      <div className={styles.spacer} />

      <div className={styles.cardWrapper}>
        <section aria-label="Форма входу ShiftPay" className={styles.card}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <div className={styles.brandLogo} aria-hidden="true">
                <span>[S/]</span>
              </div>
              <span className={styles.brandText}>ShiftPay</span>
            </div>

            <h1 className={styles.title}>Вхід у систему</h1>

            <p className={styles.subtitle}>Оберіть тип облікового запису</p>
          </header>

          <div role="tablist" aria-label="Вибір ролі" className={styles.tablist}>
            <button
              type="button"
              role="tab"
              aria-selected={role === 'employee'}
              onClick={() => setRole('employee')}
              className={`${styles.tab} ${role === 'employee' ? styles.tabActive : ''}`}
            >
              <span>Працівник</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === 'admin'}
              onClick={() => setRole('admin')}
              className={`${styles.tab} ${role === 'admin' ? styles.tabActive : ''}`}
            >
              <span>Адмін</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === 'owner'}
              onClick={() => setRole('owner')}
              className={`${styles.tab} ${role === 'owner' ? styles.tabActive : ''}`}
            >
              <span>Власник</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="loginEmail" className={styles.label}>
                Електронна пошта або телефон
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="loginPassword" className={styles.label}>
                Пароль
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
                  className={`${styles.input} ${styles.inputPassword}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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

            <div className={styles.formRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Запам'ятати мене</span>
              </label>

              <a
                href="#forgot-password"
                onClick={(e) => e.preventDefault()}
                className={styles.forgotLink}
              >
                Забули пароль?
              </a>
            </div>

            <button type="submit" className={styles.submitButton}>
              {isSubmitting ? (
                <span className={styles.spinnerContainer}>
                  <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Вхід...</span>
                </span>
              ) : (
                'Увійти'
              )}
            </button>
          </form>

          <div className={styles.footerLinks}>
            <p>
              Не маєте акаунту?{' '}
              <a href="#register" onClick={(e) => e.preventDefault()} className={styles.link}>
                Зареєструватися
              </a>
            </p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2026 ShiftPay • Безпечний вхід для закладів та персоналу
        </p>
      </footer>
    </div>
  );
}
