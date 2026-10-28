import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CustomSelect from '../../components/CustomSelect';
import Modal from '../../components/Modal';
import { formatUAH, payslips, type Payslip } from '../../data/mockData';
import page from '../../styles/page.module.css';
import styles from './EmployeeArchive.module.css';

const ALL_YEARS = 'Усі роки';
const ALL_MONTHS = 'Усі місяці';

const netOf = (p: Payslip) => p.hours * p.rate + p.bonus - p.deduction;

export default function EmployeeArchive() {
  const [year, setYear] = useState(ALL_YEARS);
  const [month, setMonth] = useState(ALL_MONTHS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Payslip | null>(null);

  const years = [ALL_YEARS, ...new Set(payslips.map((p) => p.year))];
  const months = [ALL_MONTHS, ...new Set(payslips.map((p) => p.month))];

  const filtered = payslips.filter((p) => {
    const q = search.trim().toLowerCase();
    return (
      (year === ALL_YEARS || p.year === year) &&
      (month === ALL_MONTHS || p.month === month) &&
      (!q || p.receipt.toLowerCase().includes(q) || p.paidOn.includes(q))
    );
  });

  const totalNet = filtered.reduce((sum, p) => sum + netOf(p), 0);

  return (
    <div className={page.page}>
      <PageHeader title="Архів чеків та виплат" crumbs={['Мій кабінет', 'Архів']} />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Виплат у вибірці</span>
              <span className={page.kpiValue}>{filtered.length}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Отримано загалом</span>
              <span className={page.kpiValue}>{formatUAH(totalNet)}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Відпрацьовано годин</span>
              <span className={page.kpiValue}>
                {filtered.reduce((sum, p) => sum + p.hours, 0)} год
              </span>
            </div>
          </div>

          <div className={page.toolbar}>
            <div>
              <h2 className={page.sectionTitle}>Історія виплат</h2>
              <p className={page.sectionSubtitle}>Закриті розрахункові періоди та чеки</p>
            </div>
            <div className={page.toolbarGroup}>
              <div className={page.searchWrapper} style={{ width: 240 }}>
                <span className={page.searchIcon} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="№ чека або дата..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={page.searchInput}
                  aria-label="Пошук чека"
                />
              </div>
              <div style={{ width: 150 }}>
                <CustomSelect value={year} onChange={setYear} options={years} ariaLabel="Рік" />
              </div>
              <div style={{ width: 170 }}>
                <CustomSelect
                  value={month}
                  onChange={setMonth}
                  options={months}
                  ariaLabel="Місяць"
                />
              </div>
            </div>
          </div>

          <div className={page.tableWrap}>
            <table className={page.table}>
              <thead>
                <tr>
                  <th>№ чека</th>
                  <th>Дата виплати</th>
                  <th>Період</th>
                  <th>Години</th>
                  <th>До виплати</th>
                  <th className={page.textRight}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className={`${page.mono} ${page.strong}`}>{p.receipt}</td>
                    <td className={page.mono}>{p.paidOn}</td>
                    <td className={page.muted}>{p.period}</td>
                    <td className={page.mono}>{p.hours} год</td>
                    <td className={`${page.mono} ${page.strong}`}>{formatUAH(netOf(p))}</td>
                    <td className={page.textRight}>
                      <button type="button" className={page.linkBtn} onClick={() => setSelected(p)}>
                        Переглянути чек →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className={page.emptyState}>Чеків за цими фільтрами не знайдено</div>
            )}
          </div>
        </div>
      </div>

      <PayslipModal payslip={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function PayslipModal({ payslip, onClose }: { payslip: Payslip | null; onClose: () => void }) {
  const [downloaded, setDownloaded] = useState(false);

  const close = () => {
    setDownloaded(false);
    onClose();
  };

  return (
    <Modal
      isOpen={payslip !== null}
      onClose={close}
      title={`Розрахунковий лист ${payslip?.receipt ?? ''}`}
      subtitle={payslip ? `Період ${payslip.period}` : undefined}
      width={460}
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      }
    >
      {payslip && (
        <>
          <div className={styles.receipt}>
            <div className={styles.receiptRow}>
              <span>Базова ставка</span>
              <span>
                {payslip.hours} год × {payslip.rate} ₴
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span>Нараховано</span>
              <span>{formatUAH(payslip.hours * payslip.rate)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span>Бонус</span>
              <span className={styles.plus}>+ {formatUAH(payslip.bonus)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span>Утримання</span>
              <span className={styles.minus}>− {formatUAH(payslip.deduction)}</span>
            </div>
            <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
              <span>До виплати</span>
              <span>{formatUAH(netOf(payslip))}</span>
            </div>
            <p className={page.hint}>Виплачено {payslip.paidOn} • Coffee Corner • Центр</p>
          </div>

          <div className={page.formActions} style={{ marginTop: 16 }}>
            {downloaded && <span className={page.inlineSuccess}>✓ Файл підготовлено</span>}
            <button type="button" className={page.secondaryBtn} onClick={() => setDownloaded(true)}>
              Завантажити PNG
            </button>
            <button type="button" className={page.primaryBtn} onClick={() => setDownloaded(true)}>
              Завантажити PDF
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
