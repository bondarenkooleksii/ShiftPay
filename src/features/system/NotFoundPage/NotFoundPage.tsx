import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Сторінку не знайдено</h1>
        <p className={styles.description}>
          Запитувана сторінка не існує або була переміщена. Перевірте правильність URL-адреси або
          поверніться до входу в систему ShiftPay.
        </p>
        <Link to="/login" className={styles.homeButton}>
          ← Повернутися до входу
        </Link>
      </div>
    </div>
  );
}
