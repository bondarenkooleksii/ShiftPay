import React, { useState, useRef, useEffect } from 'react';
import styles from './NotificationsPopover.module.css';

interface NotificationsPopoverProps {
  hasUnread?: boolean;
  className?: string;
}

export default function NotificationsPopover({
  hasUnread = true,
  className = '',
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(hasUnread);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className}`}>
      <button
        type="button"
        title="Сповіщення"
        aria-label="Сповіщення"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setUnread(false);
        }}
        className={`${styles.bellButton} ${isOpen ? styles.bellButtonActive : ''}`}
      >
        <svg
          className={styles.bellIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread && <span className={styles.badgeDot} />}
      </button>

      {isOpen && (
        <div
          className={styles.popover}
          role="dialog"
          aria-modal="true"
          aria-label="Список сповіщень"
        >
          <div className={styles.popoverHeader}>
            <span className={styles.popoverTitle}>Сповіщення</span>
            <button type="button" onClick={() => setUnread(false)} className={styles.markAllBtn}>
              Прочитати всі
            </button>
          </div>

          <div className={styles.list}>
            <div className={styles.item}>
              <div className={styles.itemIcon}>💳</div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>Власник надіслав виплату 8 280 ₴</div>
                <div className={styles.itemTime}>15 хвилин тому</div>
              </div>
            </div>

            <div className={styles.item}>
              <div className={styles.itemIcon}>✓</div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>Зміну за 24.09 підтверджено</div>
                <div className={styles.itemTime}>2 години тому</div>
              </div>
            </div>

            <div className={styles.item}>
              <div className={styles.itemIcon}>🔔</div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>Опубліковано новий графік на тиждень</div>
                <div className={styles.itemTime}>Вчора о 18:30</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
