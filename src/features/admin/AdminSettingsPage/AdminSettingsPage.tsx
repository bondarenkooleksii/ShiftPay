import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import QueryState from '@/shared/ui/QueryState';
import { useAuth } from '@/api/auth';
import { useCreateTemplate, useDeleteTemplate, useTemplates } from '@/api/organization';
import { useAdminSettings, useSaveAdminSettings } from '@/api/settings';
import type { ShiftTemplate } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminSettingsPage.module.css';

const BREAK_OPTIONS = ['0 хв', '15 хв', '30 хв', '45 хв', '60 хв'];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const templatesQuery = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const adminSettings = useAdminSettings();
  const saveSettings = useSaveAdminSettings();
  const templates = templatesQuery.data ?? [];
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [breakOpt, setBreakOpt] = useState(BREAK_OPTIONS[2]);
  const [removing, setRemoving] = useState<ShiftTemplate | null>(null);

  const [graceDraft, setGrace] = useState<number | null>(null);
  const grace = graceDraft ?? adminSettings.data?.graceMinutes ?? 10;
  const [saved, setSaved] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = await createTemplate.mutate({
      name: name.trim(),
      start,
      end,
      breakMinutes: parseInt(breakOpt, 10),
    });
    if (!created) return;
    setName('');
    setIsAdding(false);
  };

  const handleSaveRules = async () => {
    const result = await saveSettings.mutate({ graceMinutes: grace });
    if (!result) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={page.page}>
      <PageHeader title="Налаштування зміни" crumbs={[user?.venue ?? 'Заклад', 'Налаштування']} />

      <div className={page.content}>
        <div className={page.inner} style={{ maxWidth: 880 }}>
          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Шаблони змін</h3>
                <p className={page.cardSubtitle}>Використовуються під час внесення змін у журнал</p>
              </div>
              {!isAdding && (
                <button
                  type="button"
                  className={`${page.primaryBtn} ${page.smallBtn}`}
                  onClick={() => setIsAdding(true)}
                >
                  + Додати шаблон
                </button>
              )}
            </div>

            <QueryState
              isLoading={templatesQuery.isLoading}
              error={templatesQuery.error ?? deleteTemplate.error}
              onRetry={templatesQuery.refetch}
            />

            <div className={styles.templateList}>
              {templates.map((t) => (
                <div key={t.id} className={styles.templateRow}>
                  <div className={styles.templateIcon} aria-hidden="true">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className={styles.templateInfo}>
                    <span className={page.personName}>{t.name}</span>
                    <span className={page.personSub}>
                      {t.start} – {t.end} •{' '}
                      {t.breakMinutes ? `перерва ${t.breakMinutes} хв` : 'без перерви'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={page.linkBtnDanger}
                    onClick={() => setRemoving(t)}
                  >
                    Видалити
                  </button>
                </div>
              ))}
            </div>

            {isAdding && (
              <form className={`${page.form} ${styles.addForm}`} onSubmit={handleAdd}>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="tplName">
                    Назва шаблону <span className={page.required}>*</span>
                  </label>
                  <input
                    id="tplName"
                    required
                    placeholder="наприклад, Нічна зміна"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={page.input}
                  />
                </div>
                <div className={styles.timeRow}>
                  <div className={page.formGroup}>
                    <label className={page.label} htmlFor="tplStart">
                      Початок
                    </label>
                    <input
                      id="tplStart"
                      type="time"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className={page.input}
                    />
                  </div>
                  <div className={page.formGroup}>
                    <label className={page.label} htmlFor="tplEnd">
                      Кінець
                    </label>
                    <input
                      id="tplEnd"
                      type="time"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className={page.input}
                    />
                  </div>
                  <div className={page.formGroup}>
                    <label className={page.label}>Перерва</label>
                    <CustomSelect value={breakOpt} onChange={setBreakOpt} options={BREAK_OPTIONS} />
                  </div>
                </div>
                {createTemplate.error && (
                  <div className={page.formError} role="alert">
                    {createTemplate.error.message}
                  </div>
                )}
                <div className={page.formActions}>
                  <button
                    type="button"
                    className={page.ghostBtn}
                    onClick={() => setIsAdding(false)}
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className={page.primaryBtn}
                    disabled={createTemplate.isPending}
                  >
                    Додати шаблон
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Правила закладу</h3>
                <p className={page.cardSubtitle}>Як рахувати запізнення</p>
              </div>
            </div>
            <div className={page.formGroup}>
              <div className={styles.sliderHead}>
                <label className={page.label} htmlFor="grace">
                  Допустиме запізнення без штрафу
                </label>
                <span className={`${page.badge} ${page.badgeInfo}`}>{grace} хв</span>
              </div>
              <input
                id="grace"
                type="range"
                min={5}
                max={15}
                step={1}
                value={grace}
                onChange={(e) => setGrace(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderScale}>
                <span>5 хв</span>
                <span>10 хв</span>
                <span>15 хв</span>
              </div>
            </div>
            <div className={page.formActions} style={{ marginTop: 16 }}>
              {saveSettings.error && (
                <span className={page.errorText}>{saveSettings.error.message}</span>
              )}
              {saved && <span className={page.inlineSuccess}>✓ Правила збережено</span>}
              <button
                type="button"
                className={page.primaryBtn}
                disabled={saveSettings.isPending}
                onClick={handleSaveRules}
              >
                Зберегти
              </button>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={removing !== null}
        title="Видалити шаблон?"
        message={`Шаблон «${removing?.name ?? ''}» зникне зі списку. Уже внесені зміни не зміняться.`}
        confirmLabel="Видалити"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) deleteTemplate.mutate(removing.id);
          setRemoving(null);
        }}
      />
    </div>
  );
}
