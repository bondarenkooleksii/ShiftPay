import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import { faqItems } from '@/mocks/support';
import { SUPPORT_CATEGORIES } from '@/shared/constants/options';
import { useCreateTicket } from '@/api/settings';
import page from '@/shared/styles/page.module.css';
import styles from './OwnerSupportPage.module.css';

export default function OwnerSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTicket.mutate({ category, message });
    if (result) setTicketId(result.ticketId);
  };

  const resetForm = () => {
    setTicketId(null);
    setMessage('');
    setFileName(null);
  };

  return (
    <div className={page.page}>
      <PageHeader title="Підтримка" crumbs={['Головна', 'Підтримка']} />

      <div className={page.content}>
        <div className={`${page.inner} ${styles.layout}`}>
          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Часті запитання</h3>
                <p className={page.cardSubtitle}>Відповіді на популярні питання</p>
              </div>
            </div>
            <div className={styles.accordion}>
              {faqItems.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={item.q} className={styles.faqItem}>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                    >
                      <span>{item.q}</span>
                      <svg
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    {isOpen && <p className={styles.faqAnswer}>{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className={page.card}>
            <div className={page.cardHeader}>
              <div>
                <h3 className={page.cardTitle}>Написати в підтримку</h3>
                <p className={page.cardSubtitle}>Відповідаємо протягом робочого дня</p>
              </div>
            </div>

            {ticketId ? (
              <div className={styles.ticketSent}>
                <div className={styles.ticketIcon}>✓</div>
                <h4 className={page.cardTitle}>Звернення {ticketId} створено</h4>
                <p className={page.muted}>Ми надішлемо відповідь на вашу пошту.</p>
                <button type="button" className={page.secondaryBtn} onClick={resetForm}>
                  Нове звернення
                </button>
              </div>
            ) : (
              <form className={page.form} onSubmit={handleSubmit}>
                <div className={page.formGroup}>
                  <label className={page.label}>Категорія</label>
                  <CustomSelect
                    value={category}
                    onChange={setCategory}
                    options={SUPPORT_CATEGORIES}
                  />
                </div>
                <div className={page.formGroup}>
                  <label className={page.label} htmlFor="supportMessage">
                    Повідомлення <span className={page.required}>*</span>
                  </label>
                  <textarea
                    id="supportMessage"
                    required
                    placeholder="Опишіть ваше питання якомога детальніше..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={page.textarea}
                  />
                </div>
                <label className={styles.attach}>
                  <input
                    type="file"
                    className={styles.fileInput}
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                  />
                  <span>📎 {fileName ?? 'Прикріпити файл (скріншот, PDF)'}</span>
                </label>
                <div className={page.formActions}>
                  {createTicket.error && (
                    <span className={page.errorText}>{createTicket.error.message}</span>
                  )}
                  <button
                    type="submit"
                    className={page.primaryBtn}
                    disabled={createTicket.isPending}
                  >
                    Надіслати звернення
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
