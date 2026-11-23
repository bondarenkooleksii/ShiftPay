import { useState } from 'react';
import Header from '@/shared/layout/Header';
import CustomSelect from '@/shared/ui/CustomSelect';
import QueryState from '@/shared/ui/QueryState';
import StatusFlow, { type FlowStep } from '@/shared/ui/StatusFlow';
import NotificationsPopover from '@/shared/layout/NotificationsPopover';
import { useAuth } from '@/api/auth';
import { useShifts } from '@/api/shifts';
import { useTemplates } from '@/api/organization';
import { useConfirmPayslip, usePayslips } from '@/api/payroll';
import { useProfile } from '@/api/settings';
import { formatDate, formatHours, formatUAH, monthLabel, payslipNet } from '@/shared/lib/format';
import {
  SHIFT_STATUS_LABEL,
  shiftAmount,
  sumAmount,
  sumHours,
  unpaidBalance,
} from '@/shared/lib/payroll';
import type { Payslip, Shift, ShiftStatus } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './EmployeeHomePage.module.css';

interface EmployeeHomePageProps {
  onOpenSubmitShiftModal: () => void;
}

const MONTH_NORM_HOURS = 160;

const STATUS_BADGE: Record<ShiftStatus, string> = {
  pending: page.badgeWarning,
  clarify: page.badgeInfo,
  confirmed: page.badgeSuccess,
  rejected: page.badgeDanger,
  paid: page.badgeMuted,
};

type Stage = 'review' | 'confirmed' | 'paid' | 'rejected';

const STAGE_OF: Record<ShiftStatus, Stage> = {
  pending: 'review',
  clarify: 'review',
  confirmed: 'confirmed',
  paid: 'paid',
  rejected: 'rejected',
};

const STAGES: Omit<FlowStep<Stage>, 'count' | 'amount'>[] = [
  { key: 'review', label: 'На перевірці', hint: 'Чекає рішення адміністратора', tone: 'warning' },
  {
    key: 'confirmed',
    label: 'Підтверджено',
    hint: 'Входить у баланс, чекає виплати',
    tone: 'info',
  },
  { key: 'paid', label: 'Виплачено', hint: 'Гроші надіслано, чек в архіві', tone: 'success' },
  {
    key: 'rejected',
    label: 'Відхилено',
    hint: 'Не зараховано — див. коментар',
    tone: 'danger',
    detached: true,
  },
];

export default function EmployeeHomePage({ onOpenSubmitShiftModal }: EmployeeHomePageProps) {
  const { user } = useAuth();
  const shiftsQuery = useShifts();
  const { data: payslips = [] } = usePayslips();
  const { data: templates = [] } = useTemplates();
  const { data: profile } = useProfile();
  const confirmPayslip = useConfirmPayslip();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [justConfirmed, setJustConfirmed] = useState<Payslip | null>(null);
  const [receipt, setReceipt] = useState<Payslip | null>(null);

  const shifts = shiftsQuery.data ?? [];
  const months = [...new Set(shifts.map((s) => monthLabel(s.date)))];
  const month = selectedMonth ?? months[0] ?? monthLabel(new Date().toISOString().slice(0, 10));
  const monthShifts = shifts.filter((s) => monthLabel(s.date) === month);
  const visible = monthShifts.filter((s) => !stage || STAGE_OF[s.status] === stage);
  const steps: FlowStep<Stage>[] = STAGES.map((st) => {
    const inStage = monthShifts.filter((s) => STAGE_OF[s.status] === st.key);
    return { ...st, count: inStage.length, amount: formatUAH(sumAmount(inStage)) };
  });
  const stageLabel = STAGES.find((st) => st.key === stage)?.label;

  const balance = unpaidBalance(shifts);
  const confirmedCount = shifts.filter((s) => s.status === 'confirmed').length;
  const pendingSum = sumAmount(shifts.filter((s) => s.status === 'pending'));
  const workedHours = sumHours(
    monthShifts.filter((s) => s.status === 'confirmed' || s.status === 'paid')
  );
  const planPercent = Math.min(100, Math.round((workedHours / MONTH_NORM_HOURS) * 100));

  const unconfirmed = payslips.find((p) => !p.confirmedAt);
  const lastPayslip = payslips[0];
  const maskedIban = profile?.iban ? `UA•••${profile.iban.replace(/\s/g, '').slice(-4)}` : '—';

  const describe = (s: Shift) => {
    const template = templates.find((t) => t.id === s.templateId);
    const time = `${s.start} – ${s.end}, перерва ${s.breakMinutes} хв`;
    return template ? `${template.name} (${time})` : time;
  };

  const confirmReceived = async (payslip: Payslip) => {
    const result = await confirmPayslip.mutate(payslip.id);
    if (result) setJustConfirmed(result);
  };

  return (
    <div className={styles.container}>
      <Header
        title="Особистий кабінет"
        subtitleOrBadge={
          <div className={styles.venueBadge}>
            <span className={styles.pulseDot} />
            <span>{user?.venue ?? 'Мій заклад'}</span>
          </div>
        }
        rightContent={
          <>
            <div style={{ width: '180px' }}>
              <CustomSelect
                value={month}
                onChange={setSelectedMonth}
                options={months.length ? months : [month]}
                variant="pill"
                ariaLabel="Оберіть розрахунковий місяць"
              />
            </div>

            <NotificationsPopover />

            <button
              type="button"
              onClick={onOpenSubmitShiftModal}
              className={styles.submitShiftButton}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Подати зміну</span>
            </button>
          </>
        }
      />

      <main className={styles.main}>
        {unconfirmed ? (
          <div className={styles.bannerNotice}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerIcon} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <p className={styles.bannerText}>
                Власник надіслав виплату <strong>{formatUAH(payslipNet(unconfirmed))}</strong> за
                період {unconfirmed.period}. Перевірте надходження та підтвердіть отримання.
              </p>
            </div>

            <div className={styles.bannerActions}>
              <button
                type="button"
                onClick={() => setReceipt(unconfirmed)}
                className={styles.bannerLink}
              >
                Переглянути квитанцію
              </button>
              <button
                type="button"
                onClick={() => confirmReceived(unconfirmed)}
                disabled={confirmPayslip.isPending}
                className={styles.bannerConfirmBtn}
              >
                <span>{confirmPayslip.isPending ? 'Зберігаємо…' : 'Гроші прийшли'}</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        ) : (
          justConfirmed && (
            <div className={styles.bannerSuccess}>
              <div className={styles.bannerSuccessLeft}>
                <span className={styles.bannerSuccessIcon}>✓</span>
                <span>
                  Отримання виплати {formatUAH(payslipNet(justConfirmed))} підтверджено. Дякуємо за
                  оперативність!
                </span>
              </div>
              <button onClick={() => setJustConfirmed(null)} className={styles.restoreBannerBtn}>
                Закрити
              </button>
            </div>
          )
        )}
        {confirmPayslip.error && (
          <div className={page.formError} role="alert">
            {confirmPayslip.error.message}
          </div>
        )}

        <section aria-label="Метрики та баланс" className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Поточний баланс</span>
              <span className={styles.metricBadgeWaiting}>До виплати</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{formatUAH(balance)}</span>
            </div>
            <div className={styles.metricFooter}>
              <span>
                <strong>{confirmedCount} підтв. змін чекають виплати</strong>
                {pendingSum > 0 && (
                  <>
                    {' '}
                    •{' '}
                    <span style={{ color: '#d97706', fontWeight: 500 }}>
                      (На модерації: {formatUAH(pendingSum)})
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Відпрацьований час</span>
              <span className={styles.metricBadgePlan}>{planPercent}% плану</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{formatHours(workedHours)}</span>
            </div>
            <div className={styles.metricFooter}>
              <span>
                Норма місяця: {MONTH_NORM_HOURS} год ({planPercent}%)
              </span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${planPercent}%` }} />
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Моя ставка</span>
              <span className={styles.metricBadgeHourly}>Погодинна</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{user?.rate ?? '—'} ₴</span>
              <span className={styles.metricUnit}>/ год</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Ставку встановлює власник закладу</span>
            </div>
          </div>
        </section>

        <StatusFlow
          title={`Шлях ваших змін • ${month}`}
          steps={steps}
          active={stage}
          onSelect={setStage}
        />

        <section aria-label="Мої зміни" className={styles.shiftsSection}>
          <div className={styles.shiftsHeader}>
            <div>
              <h2 className={styles.shiftsTitle}>Мої зміни • {month}</h2>
              <p className={styles.shiftsSubtitle}>
                {stageLabel
                  ? `Показано лише зміни зі статусом «${stageLabel}»`
                  : 'Дата, тривалість, сума та статус кожної поданої зміни'}
              </p>
            </div>

            {stage ? (
              <button type="button" className={page.secondaryBtn} onClick={() => setStage(null)}>
                Показати всі ({monthShifts.length})
              </button>
            ) : (
              <span className={page.muted}>Усього змін: {monthShifts.length}</span>
            )}
          </div>

          <QueryState
            isLoading={shiftsQuery.isLoading}
            error={shiftsQuery.error}
            onRetry={shiftsQuery.refetch}
          />

          {shiftsQuery.data && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип зміни та деталі</th>
                    <th>Години</th>
                    <th>Сума до виплати</th>
                    <th className={styles.textRight}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((shift) => (
                    <tr key={shift.id}>
                      <td className={styles.shiftDate}>{formatDate(shift.date)}</td>
                      <td>
                        <div className={styles.shiftType}>
                          <span className={styles.shiftDot} />
                          <span>{describe(shift)}</span>
                        </div>
                        {shift.adminReason && (
                          <span className={page.personSub}>
                            Коментар адміністратора: {shift.adminReason}
                          </span>
                        )}
                      </td>
                      <td className={styles.shiftHours}>{formatHours(shift.hours)}</td>
                      <td className={styles.shiftAmount}>{formatUAH(shiftAmount(shift))}</td>
                      <td className={styles.textRight}>
                        <span className={`${page.badge} ${STATUS_BADGE[shift.status]}`}>
                          {SHIFT_STATUS_LABEL[shift.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <div className={page.emptyState}>
                  {stage ? (
                    <>
                      <p>
                        За {month} немає змін зі статусом «{stageLabel}».
                      </p>
                      <button type="button" className={page.linkBtn} onClick={() => setStage(null)}>
                        Показати всі зміни
                      </button>
                    </>
                  ) : (
                    <>
                      <p>За {month} ви ще не подавали змін.</p>
                      <button
                        type="button"
                        className={page.linkBtn}
                        onClick={onOpenSubmitShiftModal}
                      >
                        + Подати зміну
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {lastPayslip && (
          <section aria-label="Останні закриті виплати" className={styles.archiveSection}>
            <div className={styles.archiveLeft}>
              <div className={styles.archiveIcon} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div>
                <span className={styles.archiveLabel}>Остання виплата</span>
                <p className={styles.archiveText}>
                  <strong>{lastPayslip.paidOn}</strong> —{' '}
                  <span className={styles.archiveAmount}>{formatUAH(payslipNet(lastPayslip))}</span>{' '}
                  <span className={styles.archiveFile}>[Чек: {lastPayslip.receipt}]</span>
                </p>
              </div>
            </div>

            <div className={styles.archiveRight}>
              <span className={styles.badgePaid}>
                {lastPayslip.confirmedAt ? 'Отримано' : 'Оплачено'}
              </span>
              <button
                type="button"
                onClick={() => setReceipt(lastPayslip)}
                className={styles.downloadBtn}
              >
                Переглянути чек ↗
              </button>
            </div>
          </section>
        )}
      </main>

      {receipt && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <button
              onClick={() => setReceipt(null)}
              className={styles.modalCloseBtn}
              aria-label="Закрити квитанцію"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.receiptHeader}>
              <div className={styles.receiptCheck}>✓</div>
              <h3 className={styles.receiptTitle}>Офіційна квитанція ShiftPay</h3>
              <p className={styles.receiptSubtitle}>Платіжне доручення №{receipt.receipt}</p>
            </div>

            <div className={styles.receiptDetails}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Отримувач:</span>
                <span className={styles.receiptRowValue}>
                  {user?.name} ({receipt.method === 'iban' ? `IBAN: ${maskedIban}` : 'готівка'})
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Заклад:</span>
                <span className={styles.receiptRowValue}>{user?.venue}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Період:</span>
                <span className={styles.receiptRowValue}>{receipt.period}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Сума виплати:</span>
                <span className={styles.receiptAmount}>{formatUAH(payslipNet(receipt))}</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className={styles.receiptCloseBtn}
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
