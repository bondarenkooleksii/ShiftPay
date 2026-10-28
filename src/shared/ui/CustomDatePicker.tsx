import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomDatePicker.module.css';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const UK_MONTHS = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

const UK_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  if (dateStr.includes('.')) {
    const [d, m, y] = dateStr.split('.').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDateDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateOutput(d: Date, originalFormat: 'iso' | 'dot'): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  if (originalFormat === 'iso') {
    return `${year}-${month}-${day}`;
  }
  return `${day}.${month}.${year}`;
}

export default function CustomDatePicker({
  value,
  onChange,
  id,
  placeholder = 'ДД.ММ.РРРР',
  className = '',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialFormat: 'iso' | 'dot' = value && value.includes('-') ? 'iso' : 'dot';
  const selectedDate = value ? parseDate(value) : null;

  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : 2026);
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : 8); // 8 = September

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    onChange(formatDateOutput(d, initialFormat));
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(formatDateOutput(today, initialFormat));
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    calendarCells.push({
      day,
      month: viewMonth - 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({
      day,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalCells - calendarCells.length;
  for (let day = 1; day <= remaining; day++) {
    calendarCells.push({
      day,
      month: viewMonth + 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const isToday = (y: number, m: number, d: number) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const isSelected = (y: number, m: number, d: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === y &&
      selectedDate.getMonth() === m &&
      selectedDate.getDate() === d
    );
  };

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className}`} id={id}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${styles.inputTrigger} ${isOpen ? styles.inputTriggerOpen : ''}`}
      >
        <span className={styles.dateDisplay}>
          {selectedDate ? (
            formatDateDisplay(selectedDate)
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </span>
        <svg
          className={styles.calendarIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-modal="true" aria-label="Вибір дати">
          <div className={styles.header}>
            <span className={styles.monthYear}>
              {UK_MONTHS[viewMonth]} {viewYear}
            </span>
            <div className={styles.navBtnGroup}>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Попередній місяць"
                className={styles.navBtn}
              >
                <svg
                  className={styles.navIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Наступний місяць"
                className={styles.navBtn}
              >
                <svg
                  className={styles.navIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.weekdays}>
            {UK_WEEKDAYS.map((wd) => (
              <span key={wd} className={styles.weekday}>
                {wd}
              </span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {calendarCells.map((cell, idx) => {
              const selected = isSelected(cell.year, cell.month, cell.day);
              const todayCell = isToday(cell.year, cell.month, cell.day);

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`${styles.dayBtn} ${
                    !cell.isCurrentMonth ? styles.dayOtherMonth : ''
                  } ${todayCell ? styles.dayToday : ''} ${selected ? styles.daySelected : ''}`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={handleSelectToday} className={styles.todayBtn}>
              Сьогодні
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
