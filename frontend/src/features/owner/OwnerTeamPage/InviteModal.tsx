import React, { useState } from 'react';
import CustomSelect from '@/shared/ui/CustomSelect';
import Modal from '@/shared/ui/Modal';
import FakeQrCode from '@/shared/ui/FakeQrCode';
import { STAFF_ROLES } from '@/shared/constants/options';
import type { Venue } from '@/types';
import { useInviteMember } from '@/api/organization';
import page from '@/shared/styles/page.module.css';
import styles from './InviteModal.module.css';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
}

export default function InviteModal({ isOpen, onClose, venues }: InviteModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(STAFF_ROLES[0]);
  const [venueDraft, setVenue] = useState('');
  const venue = venueDraft || venues[0]?.name || '';
  const invite = useInviteMember();
  const [rate, setRate] = useState('90');
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setLink(null);
    setCopied(false);
    setName('');
    invite.reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await invite.mutate({ name, role, venue, rate: Number(rate), phone: '' });
    if (result) setLink(result.inviteLink);
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link).catch(() => undefined);
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
          {invite.error && (
            <div className={page.formError} role="alert">
              {invite.error.message}
            </div>
          )}
          <div className={page.formActions}>
            <button type="button" className={page.ghostBtn} onClick={close}>
              Скасувати
            </button>
            <button type="submit" className={page.primaryBtn} disabled={invite.isPending}>
              Згенерувати запрошення
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
