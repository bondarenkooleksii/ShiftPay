import React from 'react';
import styles from './StatusFlow.module.css';

export interface FlowStep<K extends string> {
  key: K;
  label: string;
  hint: string;
  count: number;
  amount?: string;
  tone: 'warning' | 'info' | 'success' | 'danger';
  detached?: boolean;
}

interface StatusFlowProps<K extends string> {
  title: string;
  steps: FlowStep<K>[];
  active: K | null;
  onSelect: (key: K | null) => void;
}

export default function StatusFlow<K extends string>({
  title,
  steps,
  active,
  onSelect,
}: StatusFlowProps<K>) {
  return (
    <section className={styles.flow} aria-label={title}>
      <div className={styles.flowHeader}>
        <span className={styles.flowTitle}>{title}</span>
        <span className={styles.flowHint}>Натисніть на етап, щоб показати лише ці зміни</span>
      </div>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const prev = steps[index - 1];
          const showArrow = index > 0 && !step.detached && !prev?.detached;
          return (
            <React.Fragment key={step.key}>
              {showArrow && (
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              )}
              {step.detached && <span className={styles.separator} aria-hidden="true" />}
              <button
                type="button"
                aria-pressed={active === step.key}
                onClick={() => onSelect(active === step.key ? null : step.key)}
                className={`${styles.step} ${styles[step.tone]} ${
                  active === step.key ? styles.stepActive : ''
                }`}
              >
                <span className={styles.stepTop}>
                  <span className={styles.dot} />
                  <span className={styles.stepLabel}>{step.label}</span>
                  <span className={styles.count}>{step.count}</span>
                </span>
                {step.amount && <span className={styles.amount}>{step.amount}</span>}
                <span className={styles.stepHint}>{step.hint}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
