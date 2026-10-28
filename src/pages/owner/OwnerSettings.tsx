import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CustomSelect from '../../components/CustomSelect';
import Toggle from '../../components/Toggle';
import page from '../../styles/page.module.css';

const FREQUENCIES = ['Щотижня', 'Раз на два тижні', 'Щомісяця'];
const CUTOFFS = ['Неділя', '15 та останній день місяця', 'Останній день місяця'];

export default function OwnerSettings() {
  const [legalName, setLegalName] = useState('ФОП Бондаренко О. В.');
  const [taxId, setTaxId] = useState('3245109876');
  const [currency, setCurrency] = useState('UAH — гривня');
  const [frequency, setFrequency] = useState(FREQUENCIES[1]);
  const [cutoff, setCutoff] = useState(CUTOFFS[1]);
  const [notify, setNotify] = useState({ telegram: true, email: true, shiftChanges: false });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={page.page}>
      <PageHeader title="Налаштування" crumbs={['Головна', 'Налаштування']} />

      <div className={page.content}>
        <form className={page.inner} style={{ maxWidth: 880 }} onSubmit={handleSave}>
          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Профіль бізнесу</h3>
                <p className={page.cardSubtitle}>Реквізити для звітів і розрахункових листів</p>
              </div>
            </div>
            <div className={page.form}>
              <div className={page.formGroup}>
                <label className={page.label} htmlFor="legalName">
                  Назва юридичної особи / ФОП
                </label>
                <input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className={page.input}
                />
              </div>
              <div className={page.formRow}>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="taxId">
                    Податковий номер (ЄДРПОУ / ІПН)
                  </label>
                  <input
                    id="taxId"
                    inputMode="numeric"
                    maxLength={10}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                    className={page.input}
                  />
                </div>
                <div className={page.formGroup}>
                  <label className={page.label}>Валюта за замовчуванням</label>
                  <CustomSelect
                    value={currency}
                    onChange={setCurrency}
                    options={['UAH — гривня', 'USD — долар США', 'EUR — євро']}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Графік виплат</h3>
                <p className={page.cardSubtitle}>Як часто закривається розрахунковий період</p>
              </div>
            </div>
            <div className={page.formRow}>
              <div className={page.formGroup}>
                <label className={page.label}>Частота виплат</label>
                <CustomSelect value={frequency} onChange={setFrequency} options={FREQUENCIES} />
              </div>
              <div className={page.formGroup}>
                <label className={page.label}>День закриття періоду</label>
                <CustomSelect value={cutoff} onChange={setCutoff} options={CUTOFFS} />
              </div>
            </div>
          </section>

          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Сповіщення</h3>
                <p className={page.cardSubtitle}>Куди надсилати оновлення</p>
              </div>
            </div>
            <div className={page.toggleList}>
              <div className={page.toggleRow}>
                <div>
                  <span className={page.toggleTitle}>Сповіщення в Telegram</span>
                  <span className={page.toggleDesc}>Миттєві повідомлення про нові зміни</span>
                </div>
                <Toggle
                  label="Сповіщення в Telegram"
                  checked={notify.telegram}
                  onChange={(v) => setNotify({ ...notify, telegram: v })}
                />
              </div>
              <div className={page.toggleRow}>
                <div>
                  <span className={page.toggleTitle}>Щотижневий звіт на Email</span>
                  <span className={page.toggleDesc}>Підсумок годин і витрат щопонеділка</span>
                </div>
                <Toggle
                  label="Щотижневий звіт на Email"
                  checked={notify.email}
                  onChange={(v) => setNotify({ ...notify, email: v })}
                />
              </div>
              <div className={page.toggleRow}>
                <div>
                  <span className={page.toggleTitle}>Зміни у відпрацьованому часі</span>
                  <span className={page.toggleDesc}>
                    Коли адміністратор коригує або відхиляє зміну
                  </span>
                </div>
                <Toggle
                  label="Зміни у відпрацьованому часі"
                  checked={notify.shiftChanges}
                  onChange={(v) => setNotify({ ...notify, shiftChanges: v })}
                />
              </div>
            </div>
          </section>

          <div className={page.formActions} style={{ borderTop: 'none', paddingTop: 0 }}>
            {saved && <span className={page.inlineSuccess}>✓ Зміни збережено</span>}
            <button type="submit" className={page.primaryBtn}>
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
