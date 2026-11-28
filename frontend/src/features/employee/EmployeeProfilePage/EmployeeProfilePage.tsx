import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import Toggle from '@/shared/ui/Toggle';
import QueryState from '@/shared/ui/QueryState';
import { useChangePassword, useProfile, useSaveProfile } from '@/api/settings';
import type { EmployeeProfile } from '@/types';
import page from '@/shared/styles/page.module.css';

const formatIban = (raw: string) => {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 29);
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

const isValidIban = (value: string) => /^UA\d{27}$/.test(value.replace(/\s/g, ''));

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').replace(/^380/, '').slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return '+380 ' + parts.filter(Boolean).join(' ');
};

export default function EmployeeProfilePage() {
  const profile = useProfile();

  if (!profile.data) {
    return (
      <div className={page.page}>
        <PageHeader title="Налаштування профілю" crumbs={['Мій кабінет', 'Профіль']} />
        <QueryState isLoading={profile.isLoading} error={profile.error} onRetry={profile.refetch} />
      </div>
    );
  }

  return <ProfileForm initial={profile.data} />;
}

function ProfileForm({ initial }: { initial: EmployeeProfile }) {
  const saveProfile = useSaveProfile();
  const changePassword = useChangePassword();
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [telegram, setTelegram] = useState(initial.telegram);
  const [iban, setIban] = useState(initial.iban);
  const [notify, setNotify] = useState(initial.notify);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  const ibanInvalid = iban.length > 0 && !isValidIban(iban);
  const pwdMismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
  const pwdTooShort = newPwd.length > 0 && newPwd.length < 8;

  const flash = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ibanInvalid) return;
    const saved = await saveProfile.mutate({ fullName, phone, telegram, iban, notify });
    if (saved) flash(setProfileSaved);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || pwdMismatch || pwdTooShort || !newPwd) return;
    const result = await changePassword.mutate({
      currentPassword: currentPwd,
      newPassword: newPwd,
    });
    if (result === undefined) return;
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    flash(setPwdSaved);
  };

  return (
    <div className={page.page}>
      <PageHeader title="Налаштування профілю" crumbs={['Мій кабінет', 'Профіль']} />

      <div className={page.content}>
        <div className={page.inner} style={{ maxWidth: 880 }}>
          <form className={page.inner} onSubmit={handleProfileSave}>
            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>Особисті дані</h3>
                  <p className={page.cardSubtitle}>Видно адміністратору вашого закладу</p>
                </div>
              </div>
              <div className={page.form}>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="fullName">
                    Ім’я та прізвище
                  </label>
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={page.input}
                  />
                </div>
                <div className={page.formRow}>
                  <div className={page.formGroup}>
                    <label className={page.label} htmlFor="phone">
                      Номер телефону
                    </label>
                    <input
                      id="phone"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className={page.input}
                    />
                  </div>
                  <div className={page.formGroup}>
                    <label className={page.label} htmlFor="telegram">
                      Telegram
                    </label>
                    <input
                      id="telegram"
                      value={telegram}
                      onChange={(e) =>
                        setTelegram('@' + e.target.value.replace(/^@+/, '').replace(/\s/g, ''))
                      }
                      className={page.input}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>Реквізити для виплат</h3>
                  <p className={page.cardSubtitle}>Рахунок, на який надходить зарплата</p>
                </div>
              </div>
              <div className={page.formGroup}>
                <label className={page.label} htmlFor="iban">
                  IBAN
                </label>
                <input
                  id="iban"
                  value={iban}
                  onChange={(e) => setIban(formatIban(e.target.value))}
                  placeholder="UA00 0000 0000 0000 0000 0000 0000 0"
                  className={`${page.input} ${page.mono} ${ibanInvalid ? page.inputError : ''}`}
                  aria-invalid={ibanInvalid}
                />
                {ibanInvalid ? (
                  <span className={page.errorText}>IBAN має починатися з UA і містити 27 цифр</span>
                ) : (
                  <span className={page.hint}>Формат: UA + 27 цифр</span>
                )}
              </div>
            </section>

            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>Сповіщення</h3>
                </div>
              </div>
              <div className={page.toggleList}>
                <div className={page.toggleRow}>
                  <div>
                    <span className={page.toggleTitle}>Зміну підтверджено</span>
                    <span className={page.toggleDesc}>
                      Коли адміністратор підтверджує вашу зміну
                    </span>
                  </div>
                  <Toggle
                    label="Зміну підтверджено"
                    checked={notify.approved}
                    onChange={(v) => setNotify({ ...notify, approved: v })}
                  />
                </div>
                <div className={page.toggleRow}>
                  <div>
                    <span className={page.toggleTitle}>Виплату надіслано</span>
                    <span className={page.toggleDesc}>Коли власник проводить виплату</span>
                  </div>
                  <Toggle
                    label="Виплату надіслано"
                    checked={notify.payout}
                    onChange={(v) => setNotify({ ...notify, payout: v })}
                  />
                </div>
              </div>
            </section>

            <div className={page.formActions} style={{ borderTop: 'none', paddingTop: 0 }}>
              {saveProfile.error && (
                <span className={page.errorText}>{saveProfile.error.message}</span>
              )}
              {profileSaved && <span className={page.inlineSuccess}>✓ Профіль збережено</span>}
              <button type="submit" className={page.primaryBtn} disabled={saveProfile.isPending}>
                Зберегти зміни
              </button>
            </div>
          </form>

          <form className={page.card} onSubmit={handlePasswordSave}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Зміна пароля</h3>
                <p className={page.cardSubtitle}>Мінімум 8 символів</p>
              </div>
            </div>
            <div className={page.form}>
              <div className={page.formGroup}>
                <label className={page.label} htmlFor="currentPwd">
                  Поточний пароль
                </label>
                <input
                  id="currentPwd"
                  type="password"
                  autoComplete="current-password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className={page.input}
                />
              </div>
              <div className={page.formRow}>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="newPwd">
                    Новий пароль
                  </label>
                  <input
                    id="newPwd"
                    type="password"
                    autoComplete="new-password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className={`${page.input} ${pwdTooShort ? page.inputError : ''}`}
                  />
                  {pwdTooShort && <span className={page.errorText}>Щонайменше 8 символів</span>}
                </div>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="confirmPwd">
                    Повторіть пароль
                  </label>
                  <input
                    id="confirmPwd"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className={`${page.input} ${pwdMismatch ? page.inputError : ''}`}
                  />
                  {pwdMismatch && <span className={page.errorText}>Паролі не збігаються</span>}
                </div>
              </div>
              <div className={page.formActions}>
                {changePassword.error && (
                  <span className={page.errorText}>{changePassword.error.message}</span>
                )}
                {pwdSaved && <span className={page.inlineSuccess}>✓ Пароль змінено</span>}
                <button
                  type="submit"
                  className={page.secondaryBtn}
                  disabled={changePassword.isPending}
                >
                  Оновити пароль
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
