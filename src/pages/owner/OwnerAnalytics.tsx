import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CustomSelect from '../../components/CustomSelect';
import {
  ANALYTICS_PERIODS,
  formatUAH,
  peakHours,
  venueLaborCost,
  weeklyHours,
} from '../../data/mockData';
import page from '../../styles/page.module.css';
import styles from './OwnerAnalytics.module.css';

const MONTHLY_BUDGET = 60000;

function exportCsv(period: string) {
  const rows = [
    ['Заклад', 'Витрати на персонал, грн'],
    ...venueLaborCost.map((v) => [v.venue, String(v.amount)]),
    [],
    ['День', 'Години'],
    ...weeklyHours.map((d) => [d.day, String(d.hours)]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n');
  // BOM so Excel opens Cyrillic correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shiftpay-report-${period.replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OwnerAnalytics() {
  const [period, setPeriod] = useState(ANALYTICS_PERIODS[0]);

  const totalCost = venueLaborCost.reduce((sum, v) => sum + v.amount, 0);
  const maxVenue = Math.max(...venueLaborCost.map((v) => v.amount));
  const maxHours = Math.max(...weeklyHours.map((d) => d.hours));
  const peak = peakHours.reduce((a, b) => (b.load > a.load ? b : a));
  const utilization = Math.round((totalCost / MONTHLY_BUDGET) * 100);

  // Gauge: semicircle arc length for the utilization share.
  const radius = 80;
  const arc = Math.PI * radius;
  const filled = (Math.min(utilization, 100) / 100) * arc;

  return (
    <div className={page.page}>
      <PageHeader
        title="Аналітика"
        crumbs={['Головна', 'Аналітика']}
        right={
          <>
            <div style={{ width: 200 }}>
              <CustomSelect
                value={period}
                onChange={setPeriod}
                options={ANALYTICS_PERIODS}
                ariaLabel="Період звіту"
              />
            </div>
            <button type="button" className={page.secondaryBtn} onClick={() => exportCsv(period)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              <span>Експорт звіту</span>
            </button>
          </>
        }
      />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Загальні витрати на персонал</span>
              <span className={page.kpiValue}>{formatUAH(totalCost)}</span>
              <span className={page.kpiHint}>{period}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Середня ставка в мережі</span>
              <span className={page.kpiValue}>98 ₴/год</span>
              <span className={page.kpiHint}>+4% до попереднього періоду</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Пікова година навантаження</span>
              <span className={page.kpiValue}>{peak.hour}</span>
              <span className={page.kpiHint}>{peak.load}% персоналу задіяно</span>
            </div>
          </div>

          <div className={page.grid2}>
            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>Витрати на персонал по закладах</h3>
                  <p className={page.cardSubtitle}>Нараховані зарплати за період</p>
                </div>
              </div>
              <div className={styles.hBars}>
                {venueLaborCost.map((v) => (
                  <div key={v.venue} className={styles.hBarRow}>
                    <div className={styles.hBarLabel}>
                      <span>{v.venue}</span>
                      <span className={page.strong}>{formatUAH(v.amount)}</span>
                    </div>
                    <div className={styles.hBarTrack}>
                      <div
                        className={styles.hBarFill}
                        style={{ width: `${(v.amount / maxVenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>Використання місячного бюджету</h3>
                  <p className={page.cardSubtitle}>Ліміт {formatUAH(MONTHLY_BUDGET)}</p>
                </div>
              </div>
              <div className={styles.gauge}>
                <svg viewBox="0 0 200 110" width="220" aria-hidden="true">
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={16}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={16}
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${arc}`}
                  />
                </svg>
                <div className={styles.gaugeValue}>
                  <span className={page.kpiValue}>{utilization}%</span>
                  <span className={page.kpiHint}>
                    залишок {formatUAH(MONTHLY_BUDGET - totalCost)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Щільність годин по днях тижня</h3>
                <p className={page.cardSubtitle}>Сумарні години всіх працівників</p>
              </div>
              <span className={`${page.badge} ${page.badgeInfo}`}>
                {weeklyHours.reduce((s, d) => s + d.hours, 0)} год за тиждень
              </span>
            </div>
            <div className={styles.vBars} role="img" aria-label="Графік годин по днях тижня">
              {weeklyHours.map((d) => (
                <div key={d.day} className={styles.vBarCol}>
                  <span className={styles.vBarValue}>{d.hours}</span>
                  <div className={styles.vBarTrack}>
                    <div
                      className={`${styles.vBarFill} ${d.hours === maxHours ? styles.vBarPeak : ''}`}
                      style={{ height: `${(d.hours / maxHours) * 100}%` }}
                    />
                  </div>
                  <span className={styles.vBarLabel}>{d.day}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
