import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import Modal from '@/shared/ui/Modal';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import QueryState from '@/shared/ui/QueryState';
import { useTeam, useUpdateMember, useVenues } from '@/api/organization';
import { STAFF_ROLES } from '@/shared/constants/options';
import { getInitials } from '@/shared/lib/format';
import type { TeamMember } from '@/types';
import page from '@/shared/styles/page.module.css';
import InviteModal from './InviteModal';

const ALL_ROLES = 'Усі ролі';

export default function OwnerTeamPage() {
  const teamQuery = useTeam();
  const { data: venues = [] } = useVenues();
  const updateMember = useUpdateMember();
  const team = teamQuery.data ?? [];
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
  const avgRate = team.length
    ? Math.round(team.reduce((sum, m) => sum + m.rate, 0) / team.length)
    : 0;

  const toggleActive = (member: TeamMember) =>
    updateMember.mutate({ id: member.id, active: !member.active });

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

          <QueryState
            isLoading={teamQuery.isLoading}
            error={teamQuery.error}
            onRetry={teamQuery.refetch}
          />

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
                        <div className={page.avatar}>{getInitials(m.name)}</div>
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
                            onClick={() => toggleActive(m)}
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
            if (!editing) return;
            updateMember.mutate({ id: editing.id, rate: Number(editRate) }).then((saved) => {
              if (saved) setEditing(null);
            });
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
            <span className={page.hint}>
              Поточна ставка: {editing?.rate} ₴/год. Нова ставка діятиме для нових змін.
            </span>
            {updateMember.error && (
              <span className={page.errorText}>{updateMember.error.message}</span>
            )}
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
          if (deactivating) toggleActive(deactivating);
          setDeactivating(null);
        }}
      />
    </div>
  );
}
