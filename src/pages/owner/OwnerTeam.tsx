import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CustomSelect from '../../components/CustomSelect';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FakeQrCode from '../../components/FakeQrCode';
import { initialTeam, STAFF_ROLES, type TeamMember, type Venue } from '../../data/mockData';
import page from '../../styles/page.module.css';
import styles from './OwnerTeam.module.css';

interface OwnerTeamProps {
  venues: Venue[];
}

const ALL_ROLES = 'Усі ролі';

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

export default function OwnerTeam({ venues }: OwnerTeamProps) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [editRate, setEditRate] = useState('');
  const [deactivating, setDeactivating] = useState<TeamMember | null>(null);

  const filtered = team.filter(
    (m) =>
      (roleFilter === ALL_ROLES || m.role === roleFilter) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = team.filter((m) => m.active).length;
  const avgRate = Math.round(team.reduce((sum, m) => sum + m.rate, 0) / team.length);

  const toggleActive = (id: string) =>
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));

  return (
    <div className={page.page}>
      <PageHeader
        title="Команда та ролі"
        crumbs={['Головна', 'Команда']}
        right={
          <button type="button" className={page.primaryBtn} onClick={() => setIsInviteOpen(true)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Запросити працівника</span>
          </button>
        }
      />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Усього в команді</span>
              <span className={page.kpiValue}>{team.length}</span>
              <span className={page.kpiHint}>у {venues.length} закладах</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Активні працівники</span>
              <span className={page.kpiValue}>{activeCount}</span>
              <span className={page.kpiHint}>{team.length - activeCount} деактивовано</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Середня ставка</span>
              <span className={page.kpiValue}>{avgRate} ₴/год</span>
              <span className={page.kpiHint}>по всій мережі</span>
            </div>
          </div>

          <div className={page.toolbar}>
            <div>
              <h2 className={page.sectionTitle}>Персонал</h2>
              <p className={page.sectionSubtitle}>Ролі, ставки та статус працевлаштування</p>
            </div>
            <div className={page.toolbarGroup}>
              <div className={page.searchWrapper}>
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
                  placeholder="Пошук за ім’ям..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={page.searchInput}
                  aria-label="Пошук працівника"
                />
              </div>
              <div className={page.selectNarrow}>
                <CustomSelect
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[ALL_ROLES, ...STAFF_ROLES]}
                  ariaLabel="Фільтр за роллю"
                />
              </div>
            </div>
          </div>

          <div className={page.tableWrap}>
            <table className={page.table}>
              <thead>
                <tr>
                  <th>Працівник</th>
                  <th>Роль</th>
                  <th>Заклад</th>
                  <th>Ставка</th>
                  <th>Статус</th>
                  <th className={page.textRight}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className={m.active ? undefined : page.rowInactive}>
                    <td>
                      <div className={page.personCell}>
                        <div className={page.avatar}>{initials(m.name)}</div>
                        <div>
                          <span className={page.personName}>{m.name}</span>
                          <span className={page.personSub}>{m.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${page.badge} ${page.badgeInfo}`}>{m.role}</span>
                    </td>
                    <td className={page.muted}>{m.venue}</td>
                    <td className={`${page.strong} ${page.mono}`}>{m.rate} ₴/год</td>
                    <td>
                      {m.active ? (
                        <span className={`${page.badge} ${page.badgeSuccess}`}>
                          <span className={page.dot} />
                          Активний
                        </span>
                      ) : (
                        <span className={`${page.badge} ${page.badgeMuted}`}>
                          <span className={page.dot} />
                          Деактивований
                        </span>
                      )}
                    </td>
                    <td className={page.textRight}>
                      <div className={page.rowActions}>
                        <button
                          type="button"
                          className={page.linkBtn}
                          onClick={() => {
                            setEditing(m);
                            setEditRate(String(m.rate));
                          }}
                        >
                          Змінити ставку
                        </button>
                        {m.active ? (
                          <button
                            type="button"
                            className={page.linkBtnDanger}
                            onClick={() => setDeactivating(m)}
                          >
                            Деактивувати
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={page.linkBtn}
                            onClick={() => toggleActive(m.id)}
                          >
                            Активувати
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className={page.emptyState}>Нікого не знайдено за цими фільтрами</div>
            )}
          </div>
        </div>
      </div>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} venues={venues} />

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Змінити погодинну ставку"
        subtitle={editing?.name}
        width={400}
        icon={<span style={{ fontWeight: 700 }}>₴</span>}
      >
        <form
          className={page.form}
          onSubmit={(e) => {
            e.preventDefault();
            const rate = Number(editRate);
            if (!editing || !rate) return;
            setTeam((prev) => prev.map((m) => (m.id === editing.id ? { ...m, rate } : m)));
            setEditing(null);
          }}
        >
          <div className={page.formGroup}>
            <label className={page.label} htmlFor="editRate">
              Ставка, ₴/год
            </label>
            <input
              id="editRate"
              type="number"
              min={1}
              value={editRate}
              onChange={(e) => setEditRate(e.target.value)}
              className={page.input}
            />
            <span className={page.hint}>Поточна ставка: {editing?.rate} ₴/год</span>
          </div>
          <div className={page.formActions}>
            <button type="button" className={page.ghostBtn} onClick={() => setEditing(null)}>
              Скасувати
            </button>
            <button type="submit" className={page.primaryBtn}>
              Зберегти
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deactivating !== null}
        title="Деактивувати працівника?"
        message={`${deactivating?.name ?? ''} більше не зможе подавати зміни. Ви зможете активувати акаунт знову будь-коли.`}
        confirmLabel="Деактивувати"
        onCancel={() => setDeactivating(null)}
        onConfirm={() => {
          if (deactivating) toggleActive(deactivating.id);
          setDeactivating(null);
        }}
      />
    </div>
  );
}

function InviteModal({
  isOpen,
  onClose,
  venues,
}: {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(STAFF_ROLES[0]);
  const [venue, setVenue] = useState(venues[0]?.name ?? '');
  const [rate, setRate] = useState('90');
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setLink(null);
    setCopied(false);
    setName('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    setLink(`https://shiftpay.app/invite/${code}`);
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the link stays visible to copy manually.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={link ? 'Запрошення створено' : 'Запросити працівника'}
      subtitle={link ? `Надішліть посилання для ${name}` : 'Працівник отримає одноразове посилання'}
      width={500}
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
          />
        </svg>
      }
    >
      {link ? (
        <div className={styles.inviteResult}>
          <div className={styles.qrBox}>
            <FakeQrCode seed={link} />
          </div>
          <div className={styles.linkRow}>
            <input readOnly value={link} className={page.input} aria-label="Посилання-запрошення" />
            <button type="button" className={page.primaryBtn} onClick={handleCopy}>
              {copied ? '✓ Скопійовано' : 'Копіювати'}
            </button>
          </div>
          <p className={page.hint}>
            {role} • {venue} • {rate} ₴/год. Посилання дійсне 48 годин.
          </p>
          <div className={page.formActions} style={{ width: '100%' }}>
            <button type="button" className={page.ghostBtn} onClick={() => setLink(null)}>
              Створити ще одне
            </button>
            <button type="button" className={page.primaryBtn} onClick={close}>
              Готово
            </button>
          </div>
        </div>
      ) : (
        <form className={page.form} onSubmit={handleSubmit}>
          <div className={page.formGroup}>
            <label className={page.label} htmlFor="inviteName">
              Ім’я та прізвище <span className={page.required}>*</span>
            </label>
            <input
              id="inviteName"
              required
              placeholder="наприклад, Ткаченко Марія"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={page.input}
            />
          </div>
          <div className={page.formRow}>
            <div className={page.formGroup}>
              <label className={page.label}>Роль</label>
              <CustomSelect value={role} onChange={setRole} options={STAFF_ROLES} />
            </div>
            <div className={page.formGroup}>
              <label className={page.label} htmlFor="inviteRate">
                Ставка, ₴/год
              </label>
              <input
                id="inviteRate"
                type="number"
                min={1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={page.input}
              />
            </div>
          </div>
          <div className={page.formGroup}>
            <label className={page.label}>Заклад</label>
            <CustomSelect value={venue} onChange={setVenue} options={venues.map((v) => v.name)} />
          </div>
          <div className={page.formActions}>
            <button type="button" className={page.ghostBtn} onClick={close}>
              Скасувати
            </button>
            <button type="submit" className={page.primaryBtn}>
              Згенерувати запрошення
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
