import React, { useState } from 'react';
import Modal from './Modal';
import CustomSelect from './CustomSelect';
import { VENUE_TYPES } from '../data/mockData';
import page from '../styles/page.module.css';

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (venue: { name: string; type: string; address: string }) => void;
}

export default function AddVenueModal({ isOpen, onClose, onCreate }: AddVenueModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState(VENUE_TYPES[0]);
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type, address: address.trim() || 'м. Київ' });
    setName('');
    setAddress('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Додати новий заклад"
      subtitle="Вкажіть базову інформацію про ваш бізнес"
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      }
    >
      <form onSubmit={handleSubmit} className={page.form}>
        <div className={page.formGroup}>
          <label className={page.label} htmlFor="venueName">
            Назва закладу <span className={page.required}>*</span>
          </label>
          <input
            id="venueName"
            type="text"
            required
            placeholder="наприклад, Espresso Bar №1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={page.input}
          />
        </div>

        <div className={page.formGroup}>
          <label className={page.label}>Тип закладу</label>
          <CustomSelect value={type} onChange={setType} options={VENUE_TYPES} />
        </div>

        <div className={page.formGroup}>
          <label className={page.label} htmlFor="venueAddress">
            Адреса розташування
          </label>
          <input
            id="venueAddress"
            type="text"
            placeholder="м. Київ, вул. Хрещатик, 15"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={page.input}
          />
        </div>

        <div className={page.formActions}>
          <button type="button" onClick={onClose} className={page.ghostBtn}>
            Скасувати
          </button>
          <button type="submit" className={page.primaryBtn}>
            Зберегти та почати
          </button>
        </div>
      </form>
    </Modal>
  );
}
