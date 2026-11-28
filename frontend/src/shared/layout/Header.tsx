import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitleOrBadge?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function Header({ title, subtitleOrBadge, rightContent }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <h1 className={styles.title}>{title}</h1>
        {subtitleOrBadge}
      </div>

      <div className={styles.rightSection}>{rightContent}</div>
    </header>
  );
}
