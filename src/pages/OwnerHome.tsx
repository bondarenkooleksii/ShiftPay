import React, { useState } from 'react';
import Header from '../components/Header';
import styles from './OwnerHome.module.css';

interface OwnerHomeProps {
  venues: Array<{ id: string; name: string; type: string; address: string; staffCount: number }>;
  onOpenAddVenueModal: () => void;
}

export default function OwnerHome({ venues, onOpenAddVenueModal }: OwnerHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header
        title="Мої заклади"
        subtitleOrBadge={
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <span className={styles.breadcrumbLink}>Головна</span>
            <span>/</span>
            <span className={styles.breadcrumbActive}>Заклади</span>
          </nav>
        }
        rightContent={
          <>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">
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
                placeholder="Пошук закладів або адрес..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <button
              type="button"
              className={styles.notificationButton}
              title="Сповіщення"
              aria-label="Сповіщення"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <span className={styles.notificationBadge} />
            </button>

            <button onClick={onOpenAddVenueModal} className={styles.addVenueButton}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Додати заклад</span>
            </button>
          </>
        }
      />

      <main className={styles.mainContent}>
        <div aria-hidden="true" className={styles.ambientLight1} />
        <div aria-hidden="true" className={styles.ambientLight2} />

        {venues.length === 0 ? (
          <section aria-label="Створення закладу" className={styles.emptyCard}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5m13.5 10.5h6.75A2.25 2.25 0 0022.5 18.75V10.5m-20.25 0l9.308-6.981a1.5 1.5 0 011.884 0l9.308 6.981m-20.25 0A2.25 2.25 0 012.25 7.5h19.5a2.25 2.25 0 012.25 3m-24 0h24"
                />
              </svg>
            </div>

            <h2 className={styles.emptyTitle}>Створіть свій перший заклад</h2>

            <p className={styles.emptyText}>
              Щоб почати облік робочих змін, призначати адміністраторів та налаштовувати заробітну
              плату, додайте вашу кав'ярню, бар чи ресторан.
            </p>

            <button type="button" onClick={onOpenAddVenueModal} className={styles.emptyButton}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Створити заклад</span>
            </button>

            <div className={styles.stepsRow}>
              <div className={styles.stepItemActive}>
                <span className={styles.stepDotActive} />
                <span>1. Створіть заклад</span>
              </div>

              <div className={styles.stepArrow} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepDot} />
                <span>2. Запросіть команду</span>
              </div>

              <div className={styles.stepArrow} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepDot} />
                <span>3. Контролюйте виплати</span>
              </div>
            </div>
          </section>
        ) : (
          <div className={styles.venuesContainer}>
            <div className={styles.venuesHeader}>
              <div>
                <h2 className={styles.venuesTitle}>Активні заклади ({filteredVenues.length})</h2>
                <p className={styles.venuesSubtitle}>
                  Керуйте змінами та ставками персоналу для кожного закладу
                </p>
              </div>
            </div>

            <div className={styles.venuesGrid}>
              {filteredVenues.map((venue) => (
                <div key={venue.id} className={styles.venueCard}>
                  <div>
                    <div className={styles.venueCardTop}>
                      <div className={styles.venueMeta}>
                        <div className={styles.venueIcon} aria-hidden="true">
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5m13.5 10.5h6.75A2.25 2.25 0 0022.5 18.75V10.5m-20.25 0l9.308-6.981a1.5 1.5 0 011.884 0l9.308 6.981m-20.25 0A2.25 2.25 0 012.25 7.5h19.5a2.25 2.25 0 012.25 3m-24 0h24"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className={styles.venueName}>{venue.name}</h3>
                          <span className={styles.venueAddress}>
                            {venue.type} • {venue.address}
                          </span>
                        </div>
                      </div>
                      <span className={styles.activeBadge}>Активний</span>
                    </div>

                    <div className={styles.venueStats}>
                      <div>
                        <span className={styles.statLabel}>Персонал:</span>
                        <span className={styles.statValue}>{venue.staffCount} працівник</span>
                      </div>
                      <div>
                        <span className={styles.statLabel}>Статус змін:</span>
                        <span className={styles.statValueGreen}>Зміна відкрита</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.venueActions}>
                    <button type="button" className={styles.settingsButton}>
                      Налаштування
                    </button>
                    <button type="button" className={styles.shiftsButton}>
                      Перейти до змін →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footerNote}>
          ShiftPay Core Platform v2.4 • Система обліку змін та розрахунку заробітної плати
        </div>
      </main>
    </div>
  );
}
